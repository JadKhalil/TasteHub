function Posts({posts}) {
    if (posts.length === 0) {
        return <div className="profile-posts-container">No posts available.</div>;
      }
    
      // If there are posts, map through them and render accordingly
      return (
        <div className="profile-posts-container">
          {posts.map(post => (
            <div key={post.id} className="post">
              {/* Replace the contents below with the actual data you want to display */}
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              {/* If you have images or other content, render them here */}
            </div>
          ))}
        </div>
      );
}

export default Posts;