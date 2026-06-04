import React, {useState, useEffect} from "react";
import { Typography, TextField, Button } from "@mui/material";
import fetchModel from "../../lib/fetchModelData";

import "./styles.css";
import {useParams, useNavigate} from "react-router-dom";

/**
 * Define UserPhotos, a React component of Project 4.
 */
function UserPhotos () {
    
    const {userId} = useParams();
    const [userPhotos, setUserPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    // 1. State for comment inputs mapped by photo_id
    const [newComments, setNewComments] = useState({});
    const navigate = useNavigate();

    const handleUserClick = (userId) => {
      navigate(`/users/${userId}`);
    }

    const loadData = async () => {
      try {
        const photos = await fetchModel(`/photos/photosOfUser/${userId}`);
        setUserPhotos(photos);
      } catch (err) {
        console.error("Failed to fetch photos", err);
      } finally {
        setNewComments({});
        setLoading(false);
      }
    };

    useEffect(() => {
      loadData();
    }, [userId]);

    // 2. Input handler
    const handleCommentChange = (photoId, text) => {
      setNewComments({ ...newComments, [photoId]: text });
    };

    // 3. Submit handler
    const handleAddComment = async (photoId) => {
      const text = newComments[photoId];
      if (!text || text.trim() === "") return;

      try {
        await fetchModel(`/photos/commentsOfPhoto/${photoId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: text })
        });
        
        // Clear the input field for this photo
        setNewComments({ ...newComments, [photoId]: "" });
        
        // Reload photos to show the new comment instantly

      } catch (err) {
        console.error("Failed to add comment", err);
      }
      loadData();
    };
    
    return (
      <div>
        {userPhotos.map((photo) => {
          return (
            <div key={photo._id} style={{ marginBottom: "40px" }}>
              <img
                src={require('../../images/' + photo.file_name)}
                alt={photo.file_name}
                style = {{maxWidth: "100%", maxHeight: "100%"}}
              />
              <h2>Comments:</h2>
              {photo.comments && photo.comments.length > 0 ? 
                <table>
                  <tbody>
                    {photo.comments.map((comment) => {
                      return (
                        <tr key={comment._id}>
                          <td>
                            <button onClick = {() => handleUserClick(comment.user._id)}>
                              <strong>{comment.user.first_name}</strong>
                            </button>: {comment.comment}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              :
                <p>No comments</p>
              }
              
              {/* 4. The Comment Input UI */}
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                <TextField 
                    label="Add a comment..." 
                    variant="outlined" 
                    size="small"
                    value={newComments[photo._id] || ""}
                    onChange={(e) => handleCommentChange(photo._id, e.target.value)}
                    style={{ flexGrow: 1 }}
                />
                <Button 
                    variant="contained" 
                    onClick={() => handleAddComment(photo._id)}
                    style={{ marginLeft: '10px' }}
                >
                    Post
                </Button>
              </div>
            </div>

          );
        })}
      </div>
    );
}

export default UserPhotos;
