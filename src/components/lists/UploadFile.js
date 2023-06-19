import { FileUpload } from '@mui/icons-material'
import { Button } from '@mui/material'
import React, { useState } from 'react'
import UploadModal from './UploadModal'

const UploadFile = ({showTrash}) => {
  const [openUploadModal, setOpenUploadModal] = useState(false)

  return (
    <div>
      <Button 
        variant="contained" 
        size='small' 
        style={{borderRadius: "30px", marginLeft: "20px"}}
        onClick={() => setOpenUploadModal(true)}
        disabled={showTrash}
      >
         <FileUpload />
      </Button>

      <UploadModal
        open={openUploadModal}
        setOpen={setOpenUploadModal}
      />
    </div>
  )
}

export default UploadFile