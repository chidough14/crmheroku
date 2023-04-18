import { Grid } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../services/LocalStorageService";



const Contact = () => {
  const token = getToken()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])
  return <>
    <Grid container justifyContent='center'>
      <Grid item sm={10}>
        <h1>Contact Page</h1>
        <hr />
        <p>Contact Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio earum officiis debitis vel tenetur quos animi vero voluptates reiciendis, omnis sed in libero temporibus deleniti pariatur expedita corporis officia. Odit enim, quasi facere magnam earum officiis ipsa aliquid impedit velit quibusdam dolor ex esse ratione explicabo quod, culpa temporibus? Dolorem deleniti doloremque maxime quas deserunt. Ex aspernatur saepe illo eaque corrupti placeat, aperiam nulla adipisci itaque quos necessitatibus iure at minus non delectus ratione quod ad. Alias dolore perferendis est expedita iure! Nostrum laborum tempore amet commodi voluptas accusamus enim repudiandae, quia odio cumque, laboriosam architecto illo! Aliquid, fuga quis.</p>
      </Grid>
    </Grid>
  </>;
};

export default Contact;
