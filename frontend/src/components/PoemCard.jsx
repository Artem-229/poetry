export default function PoemCard({ poem, onClick }) {
    return (
        <div className="card" onClick={onClick}>
            <h3>{poem.title}</h3>
            <p>{poem.content.slice(0, 100)}...</p>
            <span>❤️ {poem.likes_count}</span>
        </div>
    );
}