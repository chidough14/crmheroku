import React from 'react'
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import { Autocomplete } from '@mui/material';

const style = {
  backgroundColor: "white",
  borderRadius: "20px",
  width: "300px",
}

const SearchBar = ({setSearchQuery, data, activityModal, populateFields, navigate}) => (
  <Autocomplete
    size='small'
    freeSolo
    id="free-solo-2-demo"
    disableClearable
    options={data}
    getOptionLabel={(option) => option.name || ""}
    renderInput={(params) => (
      <TextField
        fullWidth={activityModal}
        size="small"
        {...params}
        label="Search companies"
        InputProps={{
          ...params.InputProps,
          type: 'search',
        }}
        style={activityModal ? null : style}
      />
    )}
    onInputChange={(e)=> setSearchQuery(e.target.value)}
    onChange={(e, f)=> {
      if (activityModal){
        populateFields(f)

      } else {
        navigate(`/companies/${f.id}`)
      }
    }}
    style={{
      display: "flex",
      alignSelf: "center",
      justifyContent: "center",
      flexDirection: "column",
      //padding: 10,
    }}
  />
);

export default SearchBar