function fmtDate(iso) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("ru-RU", {
        day: "numeric", month: "long", year: "numeric",
    });
}

export default function PoemCard({ poem, onClick }) {
    const preview = poem.content.slice(0, 120).trimEnd();
    const hasMore = poem.content.length > 120;

    return (
        <div className="card" onClick={onClick}>
            {poem.genre && (
                <span className="poem-genre-tag">{poem.genre}</span>
            )}
            <div className="card-title">{poem.title}</div>
            <div className="card-preview">
                {preview}{hasMore ? "..." : ""}
            </div>
            <div className="card-meta">
                <span>♥ {poem.likes_count}</span>
                <span>💬 {poem.comments_count}</span>
                {poem.written_at && (
                    <span className="card-meta-date">написано {fmtDate(poem.written_at)}</span>
                )}
                <span className="card-meta-date">опубликовано {fmtDate(poem.published_at)}</span>
            </div>
        </div>
    );
}
