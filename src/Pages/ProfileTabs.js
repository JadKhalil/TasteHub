const ProfileTabs = ({ selected, onSelect }) => {
  return (
    <div className="profile-tabs-container">
      <div 
        className={`profile-tab ${selected === 'posts' ? 'active' : ''}`}
        onClick={() => onSelect('posts')}
      >
        POSTS
      </div>
      <div 
        className={`profile-tab ${selected === 'liked' ? 'active' : ''}`}
        onClick={() => onSelect('liked')}
      >
        FAVS
      </div>
    </div>
  );
};

export default ProfileTabs;