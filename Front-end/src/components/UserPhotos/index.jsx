import React, {useState, useEffect} from "react";
import { Typography } from "@mui/material";
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
    const navigate = useNavigate();
    const handleUserClick = (userId) => {
      navigate(`/users/${userId}`);
    }

    useEffect(() => {
      const loadData = async () => {
        const userPhotos = await fetchModel(`photosOfUser/${userId}`);
        setUserPhotos(userPhotos);
        setLoading(false);
      }
      loadData();
    }, [userId]);
    
    return (
      <div>
        {/* <Typography variant="body1">
        This should be the UserPhotos view of the PhotoShare app. Since it is
        invoked from React Router the params from the route will be in property
        match. So this should show details of user:
        {user.userId}. You can fetch the model for the user
        from models.photoOfUserModel(userId):
      </Typography> */}
        {userPhotos.map((photo) => {
          return (
            // present image in images folder with file name photo.file_name
            <div>
              <img
                key = {photo._id}
                src={require('../../images/' + photo.file_name)}
                alt={photo.file_name}
                style = {{maxWidth: "100%", maxHeight: "100%"}}
              />
              <h2>Comments:</h2>
              {photo.comments ? 
                  <table>
                  {photo.comments.map((comment) => {
                    return (
                      <tr>
                        <td>
                          <button onClick = {() => handleUserClick(comment.user._id)}><strong>{comment.user.first_name}</strong></button>: {comment.comment}
                        </td>
                      </tr>
                    );
                  })}
                </table>:
                <p>No comments</p>}
            </div>

          );
        })}
      </div>
    );
}

export default UserPhotos;
