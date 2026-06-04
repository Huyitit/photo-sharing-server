import React, {useState, useEffect} from "react";
import { Typography, TextField, Button, Box, Paper } from "@mui/material";
import fetchModel from "../../lib/fetchModelData";

import "./styles.css";
import {useParams, useNavigate} from "react-router-dom";

/**
 * Define UserPhotos, a React component of Project 4.
 */
function UserPhotos ({ advancedFeatures, triggerUserListUpdate }) {
    
    // We now extract both userId and the optional photoId
    const {userId, photoId} = useParams();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Calculate which photo to show if advanced features is on
    let currentPhotoIndex = 0;
    if (advancedFeatures && userPhotos.length > 0) {
        if (photoId) {
            const index = userPhotos.findIndex(p => p._id === photoId);
            if (index !== -1) currentPhotoIndex = index;
        } else {
            // Automatically redirect to the first photo to set the URL
            navigate(`/photos/${userId}/${userPhotos[0]._id}`, { replace: true });
        }
    }

    // Stepper Handlers
    const handleNext = () => {
        const nextPhotoId = userPhotos[currentPhotoIndex + 1]._id;
        navigate(`/photos/${userId}/${nextPhotoId}`);
    };

    const handlePrev = () => {
        const prevPhotoId = userPhotos[currentPhotoIndex - 1]._id;
        navigate(`/photos/${userId}/${prevPhotoId}`);
    };

    // 2. Input handler
    const handleCommentChange = (id, text) => {
      setNewComments({ ...newComments, [id]: text });
    };

    // 3. Submit handler
    const handleAddComment = async (id) => {
      const text = newComments[id];
      if (!text || text.trim() === "") return;

      try {
        await fetchModel(`/photos/commentsOfPhoto/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: text })
        });
        
        setNewComments({ ...newComments, [id]: "" });



      } catch (err) {
        console.error("Failed to add comment", err);
      }
      loadData(); // Reload photos to show the new comment instantly
      triggerUserListUpdate();

    };
    
    const renderPhoto = (photo) => (
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

    if (loading) return <div>Loading...</div>;

    // CONDITIONAL RENDER: Stepper View
    if (advancedFeatures && userPhotos.length > 0) {
      const photo = userPhotos[currentPhotoIndex];
      return (
        <div>
            <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
                <Button 
                    variant="contained" 
                    disabled={currentPhotoIndex === 0} 
                    onClick={handlePrev}
                >
                    Prev
                </Button>
                <Typography variant="h6">Photo {currentPhotoIndex + 1} of {userPhotos.length}</Typography>
                <Button 
                    variant="contained" 
                    disabled={currentPhotoIndex === userPhotos.length - 1} 
                    onClick={handleNext}
                >
                    Next
                </Button>
            </Box>
            <Paper elevation={3} style={{ padding: '20px' }}>
                {renderPhoto(photo)}
            </Paper>
        </div>
      );
    }

    // STANDARD RENDER: List View
    return (
      <div>
        {userPhotos.map((photo) => renderPhoto(photo))}
      </div>
    );
}

export default UserPhotos;
