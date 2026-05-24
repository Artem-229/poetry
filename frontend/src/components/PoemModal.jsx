import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getPoemStatus } from "../api/poems";
import { addLike, removeLike, addFavorite, removeFavorite } from "../api/interactions";
import { getComments, createComment } from "../api/comments";

export default function PoemModal({ poem, onClose, onLikeChange, onUnfavorite }) {
    const { token } = useAuthStore();

    const [liked, setLiked] = useState(false);
    const [favorited, setFavorited] = useState(false);
    const [likesCount, setLikesCount] = useState(poem.likes_count);

    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getComments(poem.id)
            .then((r) => setComments(r.data))
            .catch(() => {});

        if (token) {
            getPoemStatus(poem.id)
                .then((r) => {
                    setLiked(r.data.liked);
                    setFavorited(r.data.favorited);
                })
                .catch(() => {});
        }
    }, [poem.id, token]);

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const toggleLike = async () => {
        if (!token) return;
        try {
            if (liked) {
                await removeLike(poem.id);
                setLiked(false);
                setLikesCount((n) => n - 1);
                onLikeChange?.(poem.id, -1);
            } else {
                await addLike(poem.id);
                setLiked(true);
                setLikesCount((n) => n + 1);
                onLikeChange?.(poem.id, 1);
            }
        } catch {}
    };

    const toggleFavorite = async () => {
        if (!token) return;
        try {
            if (favorited) {
                await removeFavorite(poem.id);
                setFavorited(false);
                onUnfavorite?.(poem.id);
            } else {
                await addFavorite(poem.id);
                setFavorited(true);
            }
        } catch {}
    };

    const submitComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmitting(true);
        try {
            const res = await createComment(poem.id, commentText.trim());
            setComments((prev) => [...prev, res.data]);
            setCommentText("");
        } catch {}
        finally { setSubmitting(false); }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{poem.title}</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Закрыть">×</button>
                </div>

                <div className="modal-body">
                    {poem.genre && (
                        <span className="poem-genre-tag" style={{ display: "inline-block", marginBottom: "0.75rem" }}>
                            {poem.genre}
                        </span>
                    )}
                    <div className="poem-text">{poem.content}</div>
                    <div className="poem-dates">
                        {poem.written_at && (
                            <span>Написано: {new Date(poem.written_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
                        )}
                        <span>Опубликовано: {new Date(poem.published_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>

                    {token ? (
                        <div className="modal-actions">
                            <button
                                className={`btn ${liked ? "active" : ""}`}
                                onClick={toggleLike}
                            >
                                ♥ {likesCount}
                            </button>
                            <button
                                className={`btn ${favorited ? "active" : ""}`}
                                onClick={toggleFavorite}
                            >
                                {favorited ? "★ В избранном" : "☆ В избранное"}
                            </button>
                        </div>
                    ) : (
                        <div className="modal-actions">
                            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                ♥ {likesCount}
                            </span>
                        </div>
                    )}

                    <div className="comments-section">
                        <h3 className="comments-title">
                            Комментарии {comments.length > 0 && `(${comments.length})`}
                        </h3>

                        {comments.length === 0 && (
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>
                                Комментариев пока нет. Будьте первым!
                            </p>
                        )}

                        {comments.map((c) => (
                            <div className="comment" key={c.id}>
                                <div className="comment-author">{c.user_email}</div>
                                <div className="comment-text">{c.text}</div>
                            </div>
                        ))}

                        {token ? (
                            <form className="comment-form" onSubmit={submitComment}>
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Напишите комментарий..."
                                    rows={3}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                    disabled={submitting || !commentText.trim()}
                                >
                                    {submitting ? "Отправляем..." : "Отправить"}
                                </button>
                            </form>
                        ) : (
                            <div className="login-prompt">
                                <Link to="/login">Войдите</Link>, чтобы оставить комментарий
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
