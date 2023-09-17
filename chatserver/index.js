const express = require('express');
const cron = require('node-cron');
const app = express();
const axios = require('axios');
const path = require('path');
const moment = require('moment');
require("dotenv").config(); 
const PORT = process.env.PORT || 4000;

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); 

const http = require('http').Server(app);

// const cors = require('cors');
// app.use(cors());

app.use(express.json()) // for json
app.use(express.urlencoded({ extended: true })) // for form data

const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

const socketIO = require('socket.io')(http, {
  // cors: {
  //     origin: "http://localhost:3000"
  // }
});

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'build/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

const addLogout = async (user) => {
  await axios.post(`${process.env.REACT_APP_BASE_URL}addlogout`, {
    user_id: parseInt(user.userId)
  })
  .then((res) => {
    //  console.log(res);
  })
  .catch((e) => console.log(e))
}

const sendEvent = (arr, data, event) => {
  let xx = arr.find((a)=> a.userId === data.follower_id)
  const {  message, sender_id, activityId } = data;
  if(xx) {
    socketIO.to(xx.id).emit(event, {message, sender: sender_id, activityId });
  }
}

let users = [];
let arr = []
//Add this before the app.get() block
socketIO.on('connection', (socket) => {
  console.log(`: ${socket.id} user just connected!`);
 
  socket.on('userId', (data) => {
    console.log(`User ${data.id} connected`);
    let ids =  arr.map((a) => a.userId)

    arr.push({id: socket.id, userId: data.id, role: data.role})
    socketIO.emit('newUserResponse', arr);
   
  });

   //sends the message to all the users on the server
  socket.on('message', (data) => {
    socketIO.emit('messageResponse', data);
  });

  socket.on('activity_closed', (data) => {
    socketIO.emit('activity_closed', data);
  });

  //sends the message to specific user on the server
  socket.on('sendNotification', (data) => {
    let xx = arr.find((a)=> a.userId === data.recipientId)
    const {  message } = data;
    if(xx) {
      socketIO.to(xx.id).emit('receiveNotification', message);
    }
  });

  socket.on('activity_moved', (data) => {
    sendEvent(arr, data, 'activity_moved')
  });

  socket.on('activity_created', (data) => {
    sendEvent(arr, data, 'activity_created')
  });

  socket.on('activity_edited', (data) => {
    sendEvent(arr, data, 'activity_edited')
  });

  socket.on('activity_deleted', (data) => {
    sendEvent(arr, data, 'activity_deleted')
  });

  socket.on('activity_restored', (data) => {
    sendEvent(arr, data, 'activity_restored')
  });

  socket.on('bulk_activity_restored', (data) => {
    sendEvent(arr, data, 'bulk_activity_restored')
  });

  socket.on('bulk_activity_deleted', (data) => {
    sendEvent(arr, data, 'bulk_activity_deleted')
  });


  socket.on('userFollowed', (data) => {
    let xx = arr.find((a)=> a.userId === data.recipientId)

    if(xx) {
      socketIO.to(xx.id).emit('reloadFollowers', "User followed");
    }
  });

  socket.on('sendConferenceNotification', (data) => {
    let newArray = arr.filter((a) => a.userId !== data.userId)

    for (let i=0; i<newArray.length; i++) {
      const { message } = data;
      socketIO.to(newArray[i].id).emit('receiveNotification', message);
    }
  });

  socket.on('newUser', (data) => {
    users.push(data);
    //Sends the list of users to the client
    socketIO.emit('newUserResponse', users);

    //Adds the new user to the list of users
    // let ids  = users.map((a) => a.socketID)
    // if (ids.includes(data.socketID)) {
    //   socketIO.emit('newUserResponse', users);
    // } else {
    //   users.push(data);
    //   //Sends the list of users to the client
    //   socketIO.emit('newUserResponse', users);
    // }
    
  });

  socket.on('new_announcement', (data) => {
    socket.emit('new_announcement_created', data);
  });

  socket.on('comment_added', (data) => {
    socket.broadcast.emit('comment_added', data);
  });

  socket.on('comment_deleted', (data) => {
    socket.broadcast.emit('comment_deleted', data);
  });

  socket.on('comment_edited', (data) => {
    socket.broadcast.emit('comment_edited', data);
  });

  socket.on('comment_upvoted', (data) => {
    socket.broadcast.emit('comment_upvoted', data);
  });

  socket.on('user typing', (data) => {
    socket.broadcast.emit('user typing', data);
  });

  socket.on('user stopped typing', (data) => {
    socket.broadcast.emit('user stopped typing', data);
  });

  socket.on('user typing reply', (data) => {
    socket.broadcast.emit('user typing reply', data);
  });

  socket.on('user stopped typing reply', (data) => {
    socket.broadcast.emit('user stopped typing reply', data);
  });

  socket.on('chat_request', (data) => {

    let newArray = arr.filter((a) => a.role === "super admin" || a.role === "admin")
    for (let i=0; i<newArray.length; i++) {

      socketIO.to(newArray[i].id).emit('chat_request', data);
    }
  });

  socket.on('chat_request_continue', (data) => {

    let newArray = arr.filter((a) => a.role === "super admin" || a.role === "admin")
    for (let i=0; i<newArray.length; i++) {

      socketIO.to(newArray[i].id).emit('chat_request_continue', data);
    }
  });

  socket.on('typing_message', (data) => {

    if (data.recipientId) {
      let xx = arr.find((a)=> a.userId === data.recipientId)

      if(xx) {
        socketIO.to(xx.id).emit('typing_message', data);
      }
    } 

    let newArray = arr.filter((a) => a.role === "super admin" || a.role === "admin")

    for (let i=0; i<newArray.length; i++) {
      socketIO.to(newArray[i].id).emit('typing_message', data);
    }
    


   
  });

  socket.on('stopped_typing_message', (data) => {

    if (data.recipientId) {
      let xx = arr.find((a)=> a.userId === data.recipientId)

      if(xx) {
        socketIO.to(xx.id).emit('stopped_typing_message', data);
      }
    } 

    let newArray = arr.filter((a) => a.role === "super admin" || a.role === "admin")

    for (let i=0; i<newArray.length; i++) {
      socketIO.to(newArray[i].id).emit('stopped_typing_message', data);
    }
    


   
  });


  socket.on('new_chat_message', (data) => {

    if (data.recipientId) {
      let xx = arr.find((a)=> a.userId === data.recipientId)

      if(xx) {
        socketIO.to(xx.id).emit('new_chat_message', data);
      }
    } 

    let newArray = arr.filter((a) => a.role === "super admin" || a.role === "admin")

    for (let i=0; i<newArray.length; i++) {
      socketIO.to(newArray[i].id).emit('new_chat_message', data);
    }
    


   
  });

  socket.on('logout', () => {
    console.log(': A user loggedout');

    let record = arr.find((a) => a.id === socket.id)
    addLogout(record)

    //Updates the list of users when a user disconnects from the server
    arr = arr.filter((user) => user.id !== socket.id)

    //Sends the list of users to the client
    socketIO.emit('userLogoutResponse', arr);
  });

  
  socket.on('disconnect', () => {
    console.log(': A user disconnected');

    //let record = arr.find((a) => a.id === socket.id)
    //addLogout(record)
 
    //Updates the list of users when a user disconnects from the server
    arr = arr.filter((user) => user.id !== socket.id)

    //Sends the list of users to the client
    socketIO.emit('userLogoutResponse', arr);
 
    socket.disconnect();
  });


});



app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

// stripe 0047664744
const fetchEvents = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/events-within-hour');
    console.log(arr, res.data.events);

    for (let i=0; i < res.data.events.length; i++) {
      let message, userId, invitedUsersId
      const title = res.data.events[i].title
      message = `Your event ${title} will begin in ${res.data.events[i].difference} minutes`

      userId = arr.find((a)=> a.userId === res.data.events[i].user_id)?.id

      if (userId) {
        socketIO.to(userId).emit('event_reminder', message);
      }

      // console.log(res.data.events[i].meeting);
      let invitedUsersArray = Object.values( res.data.events[i].meeting.invitedUsers)

      if (invitedUsersArray.length) {
        message = `Your meeting ${res.data.events[i].meeting.meetingName} will begin in ${res.data.events[i].difference} minutes`

        res.data.events[i].meeting.invitedUsers = invitedUsersArray
   
        for (let j=0; j < invitedUsersArray.length; j++) {
          invitedUsersId = arr.find((a)=> a.userId === invitedUsersArray[j].id)?.id

          if (invitedUsersId) {
            socketIO.to(invitedUsersId).emit('event_reminder', message);
          }
        }

      }

      if (res.data.events[i].meeting && res.data.events[i].meeting?.meetingType === "Anyone-can-join") {
        message = `Your meeting ${res.data.events[i]?.meeting?.meetingName} will begin in ${res.data.events[i]?.difference} minutes`
        socketIO.emit('all_event_reminder', {message, userId: res.data.events[i]?.meeting?.user_id});
      }
    }

  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

cron.schedule('*/15 * * * *', async () => {  // run task every 30 minutes
  await fetchEvents();
});

app.post("/api/create-checkout-session", async (req, res) => { 

  const { activityId } = req.body; 
  const customer = await stripe.customers.create({
    metadata: {
      userId: req.body.userId,
      activityId,
      token: req.body.token,
      items: JSON.stringify(req.body.items)
    }
  })

  let line_items = req.body.items.map((product) => {
    return  { 
      price_data: { 
        currency: "usd", 
        product_data: { 
          name: product.name, 
        }, 
        unit_amount: product.price * 100,
      }, 
      quantity: product.qty, 
    }
  })

  const session = await stripe.checkout.sessions.create({ 
    payment_method_types: ["card"], 
    shipping_address_collection: {allowed_countries: ['US', 'CA']},
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {amount: 0, currency: 'usd'},
          display_name: 'Free shipping',
          delivery_estimate: {
            minimum: {unit: 'business_day', value: 5},
            maximum: {unit: 'business_day', value: 7},
          },
        },
      },
    ],
    phone_number_collection: {
      enabled: true
    },
    customer: customer.id,
    line_items,
    mode: "payment", 
    success_url: `${process.env.CLIENT_URL}checkout-success`, 
    cancel_url: `${process.env.CLIENT_URL}activities/${activityId}`, 
  }); 
  // res.json({ id: session.id }); 
  res.send({ url: session.url }); 
}); 


const createOrder = async (customer, data) => {
  await axios.post('http://127.0.0.1:8000/api/create-order', {
    user_id: parseInt(customer.metadata.userId),
    products: [...JSON.parse(customer.metadata.items)],
    total: data.amount_total,
    subtotal: data.amount_subtotal,
    shipping: data.shipping,
    payment_status: data.payment_status,
    delivery_status: data.status,
    activity_id: parseInt(customer.metadata.activityId),
  },
  {
    headers: {
      'Authorization': `Bearer ${customer.metadata.token}`
    }
  })
  .then((res) => {
     console.log(res);
  })
  .catch((e) => console.log(e))
}


// This is your Stripe CLI webhook secret for testing your endpoint locally.
let endpointSecret
// endpointSecret = "whsec_ef0688da5a218462a5f028d6de82a7a503638ec3eea6d9927e81086e5023849a";

app.post('/api/webhook', express.raw({type: 'application/json'}), (req, response) => {
  const sig = req.headers['stripe-signature'];

  let data
  let eventType

  if (endpointSecret) {
    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      console.log("Webhook verified");
    } catch (err) {
      console.log("Webhook failed");
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    data = event.data.object
    eventType = event.type
  } else {
    data = req.body.data.object
    eventType = req.body.type
  }

  // let cust
  // let dt

  if (eventType === "checkout.session.completed") {
    stripe.customers.retrieve(data.customer).then((customer) => {
      //console.log(customer)
      //console.log("data: ", data)

      createOrder(customer, data)

      
    })
    .catch((err) => console.log(err))
  }


  // Handle the event
 

  // Return a 200 response to acknowledge receipt of the event
  response.send().end();
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});