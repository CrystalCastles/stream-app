import Footer from "../components/Layout/Footer";
import AuthComponent from "../components/Login/AuthComponent";

import classes from './Profile.module.css';

const Profile = () => {
  return (
    <div className={classes['profile-page']}>
      <AuthComponent />
      <Footer />
    </div>
  )
}

export default Profile;