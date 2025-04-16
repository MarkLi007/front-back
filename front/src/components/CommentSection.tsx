
import React, { useState, useEffect } from 'react';
import { getComments, addComment } from '../utils/comments';
import { Button } from "./ui/button";

interface Comment {
    id: number;
    paper_id: number;
    user_address: string;
    comment: string;
    created_at: string;
  }
  
  interface CommentSectionProps {
    paperId: number;
  }
  
  export default function CommentSection({ paperId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
  
    useEffect(() => {
      const fetchComments = async () => {
        const commentsData = await getComments(paperId);
        setComments(commentsData);
      };
  
      fetchComments();
    }, [paperId]);
  
    const handleAddComment = async () => {
      if (newComment.trim() !== '') {
        await addComment(paperId, newComment);
        setNewComment('');
        const commentsData = await getComments(paperId);
        setComments(commentsData);
      }
    };
  
    return (
      <div>
        <h3>Comments</h3>
        <div>
          <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
          <Button onClick={handleAddComment}>Add Comment</Button>
        </div>
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>{comment.comment}</li>
          ))}
        </ul>
      </div>
    );
  }

