import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateUserMutation } from "../../features/api/userApiSlice";
import { updateUser } from "../../features/auth/authSlice"; // if you have this

const UpdateUser = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [updateUserApi] = useUpdateUserMutation();

  const handleProfileUpdate = async (data) => {
    try {
      const response = await updateUserApi({ user_id: user.id, ...data }).unwrap();
      if (response && response.data) {
        dispatch(updateUser(response.data)); // sync with Redux
      } else {
        console.error("Update failed or response.data is undefined", response);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div>
      <h2>Update Profile</h2>
      <button onClick={() => handleProfileUpdate({ name: user?.name || '' })}>
        Update
      </button>
    </div>
  );
};

export default UpdateUser;
