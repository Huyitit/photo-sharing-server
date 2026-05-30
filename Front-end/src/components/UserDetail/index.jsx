import React, {useState, useEffect} from "react";
import {Typography} from "@mui/material";

import "./styles.css";
import {useParams, useNavigate} from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserDetail, a React component of Project 4.
 */
function UserDetail() {
    const {userId} = useParams()
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const handlePhotoClick = (userId) => {
      navigate(`/photos/${userId}`);
    }

    useEffect(()=>
    {
      const loadData = async () =>{
        const res = await fetchModel("/user/" + userId);
        setUser(res);
        setLoading(false);
      }
      loadData();
    },[userId])
    return (
        // <>
        //   <Typography variant="body1">
        //     This should be the UserDetail view of the PhotoShare app. Since it is
        //     invoked from React Router the params from the route will be in property match.
        //     So this should show details of user: {user.userId}.
        //     You can fetch the model for the user from models.userModel.
        //   </Typography>
        // </>
        <div>
          <h1>User info: </h1>
          <p>
            Name: {user.first_name} {user.last_name}
          </p>
          <p>
            Location: {user.location}
          </p>
          <p>
            Description: {user.description}
          </p>
          <p>
            Occupation: {user.occupation}
          </p>
          <button onClick={() => handlePhotoClick(user._id)}>
            Open user's photos
          </button>
        </div>
    );
}

export default UserDetail;
