import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddCredential = ({ divisionId }) => {
  const [service, setService] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:5000/api/users/division/${divisionId}/credential`,
        { service, username, password },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Credential added successfully!");
      setService("");
      setUsername("");
      setPassword("");
    } catch (error) {
      toast.error("Failed to add credential.");
    }
  };

  return (
    <div>
      <h1>Add Credential</h1>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Service"
          value={service}
          onChange={(e) => setService(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddCredential;
