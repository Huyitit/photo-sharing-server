import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper
} from "@mui/material";

import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

/**
 * Define UserComments, a React component to display all comments of a user.
 */
function UserComments() {
  const { userId } = useParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadComments = async () => {
      try {
        const res = await fetchModel(`/user/comments/${userId}`);
        setComments(res);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setLoading(false);
      }
    };
    loadComments();
  }, [userId]);

  const handleItemClick = (photoOwnerId) => {
    // Navigate to the photo's detail view (which is typically the owner's photos list)
    navigate(`/photos/${photoOwnerId}`);
  };

  if (loading) {
    return <Typography>Loading comments...</Typography>;
  }

  if (comments.length === 0) {
    return <Typography>This user has not authored any comments.</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        User Comments
      </Typography>
      <List>
        {comments.map((item, index) => (
          <React.Fragment key={item._id}>
            <ListItem 
              alignItems="flex-start" 
              button 
              onClick={() => handleItemClick(item.photo.user_id)}
            >
              <ListItemAvatar>
                <Avatar 
                  variant="square"
                  src={require(`../../images/${item.photo.file_name}`)} 
                  alt="thumbnail"
                  sx={{ width: 56, height: 56, marginRight: 2, cursor: 'pointer' }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={item.comment}
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.date_time).toLocaleString()}
                  </Typography>
                }
              />
            </ListItem>
            {index < comments.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}

export default UserComments;
