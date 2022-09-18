import AuthComponent from "../components/Login/AuthComponent";

import classes from './Profile.module.css';

const Profile = () => {
  return (
    <div className={classes['profile-page']}>
      <AuthComponent />
    </div>
  )
}

export default Profile;