import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DivisionRepository = ({ divisionId }) => {
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/division/${divisionId}/repository`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCredentials(response.data.credentials);
      } catch (error) {
        toast.error("Failed to load credentials.");
      }
    };

    fetchCredentials();
  }, [divisionId]);

  return (
    <div>
      <h1>Division Repository</h1>
      <ul>
        {credentials.map((credential) => (
          <li key={credential._id}>
            {credential.service} - {credential.username}
          </li>
        ))}
      </ul>
      <ToastContainer />
    </div>
  );
};

export default DivisionRepository;
