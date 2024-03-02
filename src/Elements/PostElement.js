import "./PostElement.css";

const PostElement = ({ postObject }) => {
    // "numberOfComments": "0",
    // "numberOfLikes": "0",
    // "prepTime": "5",
    // "recipeName": "pasta",
    // "userEmail": "edward.an@gmail.xom",
    // "category": "Food",
    // "datePosted": "1709087200306",
    // "imageLink": "https://res.cloudinary.com/dh28kj5kr/image/upload/v1709087200/vugfdmafjchma3dgrppa.jpg",
    // "postID": "29ccc152-a214-44f7-8373-4212738b39a7",
    // "postDescription": "Food"
    return (
    <div className="post-container">
        <h4 className="post-name">{postObject?.recipeName}</h4>
        <img src={postObject?.imageLink} className="post-image"></img>
        <p className="post-description">{postObject?.postDescription}</p>

    </div>
    );

}


export default PostElement;