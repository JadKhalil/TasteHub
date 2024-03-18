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
        className={`profile-tab ${selected === 'saved' ? 'active' : ''}`}
        onClick={() => onSelect('saved')}
      >
        SAVED
      </div>
      <div 
        className={`profile-tab ${selected === 'tagged' ? 'active' : ''}`}
        onClick={() => onSelect('tagged')}
      >
        TAGGED
      </div>
    </div>
  );
};

export default ProfileTabs;