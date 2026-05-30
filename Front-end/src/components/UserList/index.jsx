import React, { useState, useEffect } from "react";
import {
  Divider,
  List,
  ListItemText,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/material";

import "./styles.css";
// import models from "../../modelData/models";
import fetchModel from "../../lib/fetchModelData";
import { useNavigate } from "react-router-dom";
/**
 * Define UserList, a React component of Project 4.
 */
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() =>{
    const loadData = async () =>{
      // await fetchModel("/user/list").then((res) =>{
      //   setUsers(res);
      //   setLoading(false);
      // });
      const res = await fetchModel("/user/list");
      setUsers(res);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  }
  const handlePhotoClick = (userId) => {
    navigate(`/photos/${userId}`);
  }
  

  return (
    <div>
      {/* <Typography variant="body1">
          This is the user list, which takes up 3/12 of the window. You might
          choose to use <a href="https://mui.com/components/lists/">Lists</a>{" "}
          and <a href="https://mui.com/components/dividers/">Dividers</a> to
          display your users like so:
        </Typography> */}
        {loading === true ? <Typography>Loading...</Typography> : (  
        <List component="nav">
          {users.map((item) => (
            

            <Stack 
                direction = "row" 
                divider = {<Divider orientation = "vertical" flexItem/>}
                spacing={2}
              >
                <ListItemButton onClick={() => handleUserClick(item._id)}>
                        <ListItemText primary={item.first_name }/>

                </ListItemButton>
                <ListItemButton alignItem = "center" onClick = {() => handlePhotoClick(item._id)}>
                      <ListItemText primary = "Photos"/>
                    </ListItemButton>
              </Stack>
          ))}
        </List>
        )}
        {/* <Typography variant="body1">
          The model comes in from models.userListModel()
        </Typography> */}
      </div>
    );
}

export default UserList;
