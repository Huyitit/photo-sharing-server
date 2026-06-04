import React, { useState, useEffect } from "react";
import {
  Divider,
  List,
  ListItemText,
  ListItemButton,
  Stack,
  Typography,
  Chip,
  Box
} from "@mui/material";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import { useNavigate } from "react-router-dom";
/**
 * Define UserList, a React component of Project 4.
 */
function UserList(props) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() =>{
    const loadData = async () =>{
      try {
        const res = await fetchModel("/user/list");
        setUsers(res);
      } catch (err) {
        console.error("Failed to fetch users list", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [props.updateUserListTrigger]);

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  }
  const handlePhotoClick = (userId) => {
    navigate(`/photos/${userId}`);
  }
  const handleCommentClick = (userId) => {
    navigate(`/comments/${userId}`);
  }

  return (
    <div>
      {loading === true ? <Typography>Loading...</Typography> : (  
        <List component="nav">
          {users.map((item) => (
            <Stack 
                key={item._id}
                direction="row" 
                divider={<Divider orientation="vertical" flexItem/>}
                spacing={2}
                alignItems="center"
              >
                <ListItemButton onClick={() => handleUserClick(item._id)}>
                  <ListItemText primary={item.first_name} />
                </ListItemButton>
                
                <Box display="flex" alignItems="center" gap={1} pr={2}>
                  <Chip 
                    label={item.photoCount ?? 0} 
                    size="small" 
                    sx={{ backgroundColor: 'green', color: 'white', cursor: 'pointer' }} 
                    onClick={() => handlePhotoClick(item._id)} 
                    title="Photos"
                  />
                  <Chip 
                    label={item.commentCount ?? 0} 
                    size="small" 
                    sx={{ backgroundColor: 'red', color: 'white', cursor: 'pointer' }} 
                    onClick={() => handleCommentClick(item._id)} 
                    title="Comments"
                  />
                </Box>
              </Stack>
          ))}
        </List>
      )}
    </div>
  );
}

export default UserList;
