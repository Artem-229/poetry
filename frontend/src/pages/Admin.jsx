import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getPoems, createPoem, updatePoem, deletePoem } from "../api/poems";
import { getCollections, createCollection, deleteCollection } from "../api/collections";
import { getSiteContent, updateSiteContent } from "../api/siteContent";

export default function Admin() {
    const { user, token } = useAuthStore();
    const navigate = useNavigate();

    const [tab, setTab] = useState("poems");

    const [poems, setPoems] = useState([]);
    const [collections, setCollections] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editPoem, setEditPoem] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [genre, setGenre] = useState("");
    const [writtenAt, setWrittenAt] = useState("");
    const [publishedAt, setPublishedAt] = useState("");
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const [showCollForm, setShowCollForm] = useState(false);
    const [collTitle, setCollTitle] = useState("");
    const [collDesc, setCollDesc] = useState("");

    const [siteContent, setSiteContent] = useState({
        hero_name: "",
        hero_tagline: "",
        hero_description: "",
        awards: "",
        bio_1: "",
        bio_2: "",
        contact_email: "",
        contact_note: "",
    });
    const [siteSaving, setSiteSaving] = useState(false);
    const [siteSaved, setSiteSaved] = useState(false);

    useEffect(() => {
        if (!token || user?.role !== "ADMIN") {
            navigate("/");
            return;
        }
        loadPoems();
        loadCollections();
        getSiteContent().then((r) => setSiteContent((prev) => ({ ...prev, ...r.data }))).catch(() => {});
    }, [token]);

    const loadPoems = () =>
        getPoems().then((r) => setPoems(r.data)).catch(() => {});

    const loadCollections = () =>
        getCollections().then((r) => setCollections(r.data)).catch(() => {});

    const toLocal = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : "";

    const openCreate = () => {
        setEditPoem(null);
        setTitle("");
        setContent("");
        setGenre("");
        setWrittenAt("");
        setPublishedAt(toLocal(new Date().toISOString()));
        setFormError("");
        setShowForm(true);
    };

    const openEdit = (poem) => {
        setEditPoem(poem);
        setTitle(poem.title);
        setContent(poem.content);
        setGenre(poem.genre || "");
        setWrittenAt(toLocal(poem.written_at));
        setPublishedAt(toLocal(poem.published_at));
        setFormError("");
        setShowForm(true);
    };

    const savePoem = async (e) => {
        e.preventDefault();
        setFormError("");
        setSaving(true);
        const data = {
            title,
            content,
            genre: genre.trim() || null,
            written_at: writtenAt ? new Date(writtenAt).toISOString() : null,
            published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
        };
        try {
            if (editPoem) {
                await updatePoem(editPoem.id, data);
            } else {
                await createPoem(data);
            }
            setShowForm(false);
            await loadPoems();
        } catch (err) {
            setFormError(err.response?.data?.error || "Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить стихотворение?")) return;
        try {
            await deletePoem(id);
            setPoems((p) => p.filter((poem) => poem.id !== id));
        } catch {}
    };

    const saveCollection = async (e) => {
        e.preventDefault();
        try {
            await createCollection({ title: collTitle, description: collDesc });
            setShowCollForm(false);
            setCollTitle("");
            setCollDesc("");
            await loadCollections();
        } catch {}
    };

    const handleDeleteColl = async (id) => {
        if (!window.confirm("Удалить сборник?")) return;
        try {
            await deleteCollection(id);
            setCollections((c) => c.filter((col) => col.id !== id));
        } catch {}
    };

    const saveSiteContent = async (e) => {
        e.preventDefault();
        setSiteSaving(true);
        setSiteSaved(false);
        try {
            await updateSiteContent(siteContent);
            setSiteSaved(true);
            setTimeout(() => setSiteSaved(false), 3000);
        } catch {}
        finally {
            setSiteSaving(false);
        }
    };

    return (
        <div className="container">
            <h1 className="page-title">Панель управления</h1>
            <p className="page-subtitle">Управление стихами и сборниками</p>

            <div className="admin-tabs">
                <button
                    className={`admin-tab ${tab === "poems" ? "active" : ""}`}
                    onClick={() => setTab("poems")}
                >
                    Стихи
                </button>
                <button
                    className={`admin-tab ${tab === "collections" ? "active" : ""}`}
                    onClick={() => setTab("collections")}
                >
                    Сборники
                </button>
                <button
                    className={`admin-tab ${tab === "home" ? "active" : ""}`}
                    onClick={() => setTab("home")}
                >
                    Главная страница
                </button>
            </div>

            {tab === "poems" && (
                <>
                    {!showForm && (
                        <div style={{ marginBottom: "1.5rem" }}>
                            <button className="btn btn-primary" onClick={openCreate}>
                                + Добавить стихотворение
                            </button>
                        </div>
                    )}

                    {showForm && (
                        <div className="card" style={{ cursor: "default", marginBottom: "2rem" }}>
                            <h3 style={{ fontFamily: "Georgia, serif", fontWeight: "normal", marginBottom: "1.25rem" }}>
                                {editPoem ? "Редактировать стихотворение" : "Новое стихотворение"}
                            </h3>
                            {formError && <div className="error-msg">{formError}</div>}
                            <form onSubmit={savePoem}>
                                <div className="field">
                                    <label>Название</label>
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Название стихотворения"
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>Текст стихотворения</label>
                                    <textarea
                                        className="poem-textarea"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Введите текст..."
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>Рубрика / жанр</label>
                                    <input
                                        list="genre-options"
                                        value={genre}
                                        onChange={(e) => setGenre(e.target.value)}
                                        placeholder="Без рубрики"
                                    />
                                    <datalist id="genre-options">
                                        <option value="Пейзажная лирика" />
                                        <option value="Любовная лирика" />
                                        <option value="Философская лирика" />
                                        <option value="Гражданская лирика" />
                                        <option value="Духовная лирика" />
                                        <option value="Интимная лирика" />
                                    </datalist>
                                </div>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <div className="field" style={{ flex: 1 }}>
                                        <label>Дата написания</label>
                                        <input
                                            type="datetime-local"
                                            value={writtenAt}
                                            onChange={(e) => setWrittenAt(e.target.value)}
                                        />
                                    </div>
                                    <div className="field" style={{ flex: 1 }}>
                                        <label>Дата публикации</label>
                                        <input
                                            type="datetime-local"
                                            value={publishedAt}
                                            onChange={(e) => setPublishedAt(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? "Сохраняем..." : "Сохранить"}
                                    </button>
                                    <button type="button" className="btn" onClick={() => setShowForm(false)}>
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {poems.length === 0 ? (
                        <p className="empty">Стихов пока нет</p>
                    ) : (
                        poems.map((poem) => (
                            <div className="admin-poem-row" key={poem.id}>
                                <span className="admin-poem-title">{poem.title}</span>
                                <div className="admin-poem-actions">
                                    <button className="btn btn-sm" onClick={() => openEdit(poem)}>
                                        Изменить
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(poem.id)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </>
            )}

            {tab === "home" && (
                <div className="card" style={{ cursor: "default" }}>
                    <h3 style={{ fontFamily: "Georgia, serif", fontWeight: "normal", marginBottom: "1.25rem" }}>
                        Редактирование главной страницы
                    </h3>
                    {siteSaved && <div style={{ color: "green", marginBottom: "1rem" }}>Сохранено</div>}
                    <form onSubmit={saveSiteContent}>
                        <div className="field">
                            <label>Имя автора</label>
                            <input
                                value={siteContent.hero_name}
                                onChange={(e) => setSiteContent((p) => ({ ...p, hero_name: e.target.value }))}
                                placeholder="Имя Автора"
                            />
                        </div>
                        <div className="field">
                            <label>Подзаголовок (тэглайн)</label>
                            <input
                                value={siteContent.hero_tagline}
                                onChange={(e) => setSiteContent((p) => ({ ...p, hero_tagline: e.target.value }))}
                                placeholder="Поэт, мыслитель, лирик"
                            />
                        </div>
                        <div className="field">
                            <label>Краткое описание</label>
                            <textarea
                                value={siteContent.hero_description}
                                onChange={(e) => setSiteContent((p) => ({ ...p, hero_description: e.target.value }))}
                                placeholder="Несколько предложений об авторе..."
                                rows={3}
                            />
                        </div>
                        <div className="field">
                            <label>Награды и достижения (каждая с новой строки)</label>
                            <textarea
                                value={siteContent.awards}
                                onChange={(e) => setSiteContent((p) => ({ ...p, awards: e.target.value }))}
                                placeholder={"Лауреат премии «Поэт года» (2019)\nАвтор трёх поэтических сборников"}
                                rows={5}
                            />
                        </div>
                        <div className="field">
                            <label>Биография (первый абзац)</label>
                            <textarea
                                value={siteContent.bio_1}
                                onChange={(e) => setSiteContent((p) => ({ ...p, bio_1: e.target.value }))}
                                rows={4}
                            />
                        </div>
                        <div className="field">
                            <label>Биография (второй абзац)</label>
                            <textarea
                                value={siteContent.bio_2}
                                onChange={(e) => setSiteContent((p) => ({ ...p, bio_2: e.target.value }))}
                                rows={4}
                            />
                        </div>
                        <div className="field">
                            <label>Контактный email</label>
                            <input
                                type="email"
                                value={siteContent.contact_email}
                                onChange={(e) => setSiteContent((p) => ({ ...p, contact_email: e.target.value }))}
                                placeholder="poet@example.com"
                            />
                        </div>
                        <div className="field">
                            <label>Примечание для контактов</label>
                            <input
                                value={siteContent.contact_note}
                                onChange={(e) => setSiteContent((p) => ({ ...p, contact_note: e.target.value }))}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={siteSaving}>
                            {siteSaving ? "Сохраняем..." : "Сохранить"}
                        </button>
                    </form>
                </div>
            )}

            {tab === "collections" && (
                <>
                    {!showCollForm && (
                        <div style={{ marginBottom: "1.5rem" }}>
                            <button className="btn btn-primary" onClick={() => setShowCollForm(true)}>
                                + Создать сборник
                            </button>
                        </div>
                    )}

                    {showCollForm && (
                        <div className="card" style={{ cursor: "default", marginBottom: "2rem" }}>
                            <h3 style={{ fontFamily: "Georgia, serif", fontWeight: "normal", marginBottom: "1.25rem" }}>
                                Новый сборник
                            </h3>
                            <form onSubmit={saveCollection}>
                                <div className="field">
                                    <label>Название</label>
                                    <input
                                        value={collTitle}
                                        onChange={(e) => setCollTitle(e.target.value)}
                                        placeholder="Название сборника"
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>Описание</label>
                                    <textarea
                                        value={collDesc}
                                        onChange={(e) => setCollDesc(e.target.value)}
                                        placeholder="Краткое описание..."
                                    />
                                </div>
                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    <button type="submit" className="btn btn-primary">Создать</button>
                                    <button type="button" className="btn" onClick={() => setShowCollForm(false)}>
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {collections.length === 0 ? (
                        <p className="empty">Сборников пока нет</p>
                    ) : (
                        collections.map((col) => (
                            <div className="admin-poem-row" key={col.id}>
                                <span className="admin-poem-title">{col.title}</span>
                                <div className="admin-poem-actions">
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDeleteColl(col.id)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
}
