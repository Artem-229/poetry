import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getPoems, createPoem, updatePoem, deletePoem } from "../api/poems";
import { getCollections, getCollection, createCollection, deleteCollection, addPoemToCollection, removePoemFromCollection } from "../api/collections";
import { getSiteContent, updateSiteContent } from "../api/siteContent";
import { getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem, uploadFile, reorderGallery } from "../api/gallery";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

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

    const [managingCollection, setManagingCollection] = useState(null);
    const [collectionPoems, setCollectionPoems] = useState([]);
    const [togglingPoem, setTogglingPoem] = useState(null);
    const [showNewPoemInColl, setShowNewPoemInColl] = useState(false);
    const [collPoemTitle, setCollPoemTitle] = useState("");
    const [collPoemContent, setCollPoemContent] = useState("");
    const [collPoemGenre, setCollPoemGenre] = useState("");
    const [collPoemWrittenAt, setCollPoemWrittenAt] = useState("");
    const [collPoemPublishedAt, setCollPoemPublishedAt] = useState("");
    const [collPoemSaving, setCollPoemSaving] = useState(false);
    const [collPoemError, setCollPoemError] = useState("");

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
    const [heroUploading, setHeroUploading] = useState(false);

    const [galleryItems, setGalleryItems] = useState([]);
    const [galleryCaption, setGalleryCaption] = useState("");
    const [galleryFile, setGalleryFile] = useState(null);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [editGalleryItem, setEditGalleryItem] = useState(null);
    const galleryFileRef = useRef(null);
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const galleryListRef = useRef(null);

    useEffect(() => {
        if (!token || user?.role !== "ADMIN") {
            navigate("/");
            return;
        }
        loadPoems();
        loadCollections();
        loadGallery();
        getSiteContent().then((r) => setSiteContent((prev) => ({ ...prev, ...r.data }))).catch(() => {});
    }, [token]);

    const loadPoems = () =>
        getPoems().then((r) => setPoems(r.data)).catch(() => {});

    const loadCollections = () =>
        getCollections().then((r) => setCollections(r.data)).catch(() => {});

    const loadGallery = () =>
        getGallery().then((r) => setGalleryItems(r.data)).catch(() => {});

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

    const openManage = async (col) => {
        setManagingCollection(col);
        setShowCollForm(false);
        setShowNewPoemInColl(false);
        const res = await getCollection(col.id);
        setCollectionPoems(res.data.poems || []);
    };

    const closeManage = () => {
        setManagingCollection(null);
        setShowNewPoemInColl(false);
        setCollPoemTitle("");
        setCollPoemContent("");
        setCollPoemGenre("");
        setCollPoemWrittenAt("");
        setCollPoemPublishedAt("");
        setCollPoemError("");
    };

    const togglePoemInCollection = async (poemId) => {
        const inCollection = collectionPoems.some((p) => p.id === poemId);
        setTogglingPoem(poemId);
        try {
            if (inCollection) {
                await removePoemFromCollection(managingCollection.id, poemId);
                setCollectionPoems((prev) => prev.filter((p) => p.id !== poemId));
            } else {
                await addPoemToCollection(managingCollection.id, poemId);
                const added = poems.find((p) => p.id === poemId);
                if (added) setCollectionPoems((prev) => [...prev, added]);
            }
        } catch {}
        setTogglingPoem(null);
    };

    const saveCollectionPoem = async (e) => {
        e.preventDefault();
        setCollPoemError("");
        setCollPoemSaving(true);
        const data = {
            title: collPoemTitle,
            content: collPoemContent,
            genre: collPoemGenre.trim() || null,
            written_at: collPoemWrittenAt ? new Date(collPoemWrittenAt).toISOString() : null,
            published_at: collPoemPublishedAt ? new Date(collPoemPublishedAt).toISOString() : null,
        };
        try {
            const res = await createPoem(data);
            const newPoem = res.data;
            await addPoemToCollection(managingCollection.id, newPoem.id);
            setCollectionPoems((prev) => [...prev, newPoem]);
            await loadPoems();
            setCollPoemTitle("");
            setCollPoemContent("");
            setCollPoemGenre("");
            setCollPoemWrittenAt("");
            setCollPoemPublishedAt(toLocal(new Date().toISOString()));
            setShowNewPoemInColl(false);
        } catch (err) {
            setCollPoemError(err.response?.data?.error || "Ошибка сохранения");
        } finally {
            setCollPoemSaving(false);
        }
    };

    const saveCollection = async (e) => {
        e.preventDefault();
        try {
            const res = await createCollection({ title: collTitle, description: collDesc });
            setCollTitle("");
            setCollDesc("");
            await loadCollections();
            setShowCollForm(false);
            await openManage(res.data);
        } catch {}
    };

    const handleDeleteColl = async (id) => {
        if (!window.confirm("Удалить сборник?")) return;
        try {
            await deleteCollection(id);
            setCollections((c) => c.filter((col) => col.id !== id));
        } catch {}
    };

    const uploadHeroPhoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setHeroUploading(true);
        try {
            const fd = new FormData();
            fd.append("image", file);
            const res = await uploadFile(fd);
            await updateSiteContent({ hero_photo: res.data.url });
            setSiteContent((p) => ({ ...p, hero_photo: res.data.url }));
        } catch {}
        finally { setHeroUploading(false); }
    };

    const saveGalleryItem = async (e) => {
        e.preventDefault();
        if (!editGalleryItem && !galleryFile) return;
        setGalleryUploading(true);
        try {
            if (editGalleryItem) {
                await updateGalleryItem(editGalleryItem.id, { caption: galleryCaption, sort_order: editGalleryItem.sort_order });
                setEditGalleryItem(null);
            } else {
                const fd = new FormData();
                fd.append("image", galleryFile);
                fd.append("caption", galleryCaption);
                fd.append("sort_order", String(galleryItems.length));
                await createGalleryItem(fd);
            }
            setGalleryCaption("");
            setGalleryFile(null);
            if (galleryFileRef.current) galleryFileRef.current.value = "";
            await loadGallery();
        } catch {}
        finally { setGalleryUploading(false); }
    };

    const startDrag = (e, idx) => {
        e.preventDefault();
        const listEl = galleryListRef.current;
        if (!listEl) return;

        const itemEl = listEl.querySelector(`[data-gallery-idx="${idx}"]`);
        if (!itemEl) return;
        const rect = itemEl.getBoundingClientRect();

        const clone = itemEl.cloneNode(true);
        Object.assign(clone.style, {
            position: "fixed",
            left: rect.left + "px",
            top: rect.top + "px",
            width: rect.width + "px",
            margin: "0",
            zIndex: "9999",
            opacity: "0.9",
            boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
            pointerEvents: "none",
            transform: "scale(1.03)",
            transition: "none",
        });
        document.body.appendChild(clone);

        const state = {
            startIdx: idx,
            currentIdx: idx,
            clone,
            offsetY: e.clientY - rect.top,
        };

        setDragIndex(idx);

        const onMove = (ev) => {
            clone.style.top = (ev.clientY - state.offsetY) + "px";
            clone.style.visibility = "hidden";
            const elUnder = document.elementFromPoint(ev.clientX, ev.clientY);
            clone.style.visibility = "visible";
            const itemUnder = elUnder?.closest("[data-gallery-idx]");
            if (itemUnder) {
                const overIdx = parseInt(itemUnder.dataset.galleryIdx, 10);
                if (overIdx !== state.currentIdx) {
                    state.currentIdx = overIdx;
                    setDragOverIndex(overIdx);
                }
            }
        };

        const onUp = () => {
            document.body.removeChild(clone);
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);

            const { startIdx, currentIdx } = state;
            if (startIdx !== currentIdx) {
                setGalleryItems((prev) => {
                    const next = [...prev];
                    const [moved] = next.splice(startIdx, 1);
                    next.splice(currentIdx, 0, moved);
                    reorderGallery(next.map((it, i) => ({ id: it.id, sort_order: i }))).catch(() => {});
                    return next;
                });
            }
            setDragIndex(null);
            setDragOverIndex(null);
        };

        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
    };

    const handleDeleteGallery = async (id) => {
        if (!window.confirm("Удалить фото?")) return;
        try {
            await deleteGalleryItem(id);
            setGalleryItems((items) => items.filter((i) => i.id !== id));
        } catch {}
    };

    const openEditGallery = (item) => {
        setEditGalleryItem(item);
        setGalleryCaption(item.caption);
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
                <button
                    className={`admin-tab ${tab === "gallery" ? "active" : ""}`}
                    onClick={() => setTab("gallery")}
                >
                    Галерея
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
                    {siteSaved && <div className="success-msg">Сохранено</div>}
                    <div className="field" style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                        <label>Фото на главной странице</label>
                        {siteContent.hero_photo && (
                            <img
                                src={API_URL + siteContent.hero_photo}
                                alt="Текущее фото"
                                style={{ display: "block", width: 120, height: 150, objectFit: "cover", borderRadius: "var(--radius)", marginBottom: "0.75rem", border: "1px solid var(--border)" }}
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={uploadHeroPhoto}
                            disabled={heroUploading}
                            style={{ fontSize: "0.9rem" }}
                        />
                        {heroUploading && <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>Загружаем...</p>}
                    </div>
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
                    {managingCollection ? (
                        <div>
                            <button className="btn" onClick={closeManage} style={{ marginBottom: "1.5rem" }}>
                                ← К списку сборников
                            </button>
                            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: "normal", marginBottom: "0.25rem" }}>
                                {managingCollection.title}
                            </h2>
                            {managingCollection.description && (
                                <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>{managingCollection.description}</p>
                            )}

                            <div className="card" style={{ cursor: "default", marginBottom: "1.5rem" }}>
                                <h3 style={{ fontFamily: "Georgia, serif", fontWeight: "normal", marginBottom: "1rem" }}>
                                    Стихи в сборнике
                                </h3>
                                {poems.length === 0 ? (
                                    <p className="empty">Стихов пока нет</p>
                                ) : (
                                    poems.map((poem) => {
                                        const inColl = collectionPoems.some((p) => p.id === poem.id);
                                        const toggling = togglingPoem === poem.id;
                                        return (
                                            <div
                                                key={poem.id}
                                                className="admin-poem-row"
                                                style={{ cursor: toggling ? "wait" : "pointer" }}
                                                onClick={() => !toggling && togglePoemInCollection(poem.id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={inColl}
                                                    readOnly
                                                    style={{ marginRight: "0.75rem", flexShrink: 0 }}
                                                />
                                                <span className="admin-poem-title">{poem.title}</span>
                                                {toggling && (
                                                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>...</span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {!showNewPoemInColl ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setCollPoemPublishedAt(toLocal(new Date().toISOString()));
                                        setShowNewPoemInColl(true);
                                    }}
                                >
                                    + Создать новое стихотворение для сборника
                                </button>
                            ) : (
                                <div className="card" style={{ cursor: "default" }}>
                                    <h3 style={{ fontFamily: "Georgia, serif", fontWeight: "normal", marginBottom: "1.25rem" }}>
                                        Новое стихотворение
                                    </h3>
                                    {collPoemError && <div className="error-msg">{collPoemError}</div>}
                                    <form onSubmit={saveCollectionPoem}>
                                        <div className="field">
                                            <label>Название</label>
                                            <input
                                                value={collPoemTitle}
                                                onChange={(e) => setCollPoemTitle(e.target.value)}
                                                placeholder="Название стихотворения"
                                                required
                                            />
                                        </div>
                                        <div className="field">
                                            <label>Текст стихотворения</label>
                                            <textarea
                                                className="poem-textarea"
                                                value={collPoemContent}
                                                onChange={(e) => setCollPoemContent(e.target.value)}
                                                placeholder="Введите текст..."
                                                required
                                            />
                                        </div>
                                        <div className="field">
                                            <label>Рубрика / жанр</label>
                                            <input
                                                list="coll-genre-options"
                                                value={collPoemGenre}
                                                onChange={(e) => setCollPoemGenre(e.target.value)}
                                                placeholder="Без рубрики"
                                            />
                                            <datalist id="coll-genre-options">
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
                                                    value={collPoemWrittenAt}
                                                    onChange={(e) => setCollPoemWrittenAt(e.target.value)}
                                                />
                                            </div>
                                            <div className="field" style={{ flex: 1 }}>
                                                <label>Дата публикации</label>
                                                <input
                                                    type="datetime-local"
                                                    value={collPoemPublishedAt}
                                                    onChange={(e) => setCollPoemPublishedAt(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "0.75rem" }}>
                                            <button type="submit" className="btn btn-primary" disabled={collPoemSaving}>
                                                {collPoemSaving ? "Сохраняем..." : "Создать и добавить в сборник"}
                                            </button>
                                            <button type="button" className="btn" onClick={() => setShowNewPoemInColl(false)}>
                                                Отмена
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
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
                                            <button type="submit" className="btn btn-primary">Создать и добавить стихи</button>
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
                                                className="btn btn-sm"
                                                onClick={() => openManage(col)}
                                            >
                                                Управлять стихами
                                            </button>
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
                </>
            )}
            {tab === "gallery" && (
                <>
                    <div className="card" style={{ cursor: "default", marginBottom: "2rem" }}>
                        <h3 style={{ fontFamily: "Georgia, serif", fontWeight: "normal", marginBottom: "1.25rem" }}>
                            {editGalleryItem ? "Редактировать подпись" : "Добавить фото"}
                        </h3>
                        <form onSubmit={saveGalleryItem}>
                            {!editGalleryItem && (
                                <div className="field">
                                    <label>Фото</label>
                                    <input
                                        ref={galleryFileRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setGalleryFile(e.target.files[0])}
                                        required
                                        style={{ fontSize: "0.9rem" }}
                                    />
                                </div>
                            )}
                            <div className="field">
                                <label>Подпись</label>
                                <input
                                    value={galleryCaption}
                                    onChange={(e) => setGalleryCaption(e.target.value)}
                                    placeholder="Например: с главой стихотворного клуба Москвы"
                                />
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <button type="submit" className="btn btn-primary" disabled={galleryUploading}>
                                    {galleryUploading ? "Загружаем..." : editGalleryItem ? "Сохранить" : "Добавить"}
                                </button>
                                {editGalleryItem && (
                                    <button type="button" className="btn" onClick={() => { setEditGalleryItem(null); setGalleryCaption(""); }}>
                                        Отмена
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {galleryItems.length > 0 && (
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                            Зажмите и перетащите фото чтобы изменить порядок
                        </p>
                    )}

                    {galleryItems.length === 0 ? (
                        <p className="empty">Фотографий пока нет</p>
                    ) : (
                        <div ref={galleryListRef}>
                            {galleryItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    data-gallery-idx={idx}
                                    className={
                                        "admin-gallery-row" +
                                        (dragIndex === idx ? " gallery-dragging" : "") +
                                        (dragOverIndex === idx && dragIndex !== idx ? " gallery-drag-over" : "")
                                    }
                                >
                                    <span
                                        className="drag-handle"
                                        onPointerDown={(e) => startDrag(e, idx)}
                                        title="Перетащить"
                                    >
                                        ⠿
                                    </span>
                                    <img
                                        src={API_URL + item.image_url}
                                        alt={item.caption}
                                        className="gallery-thumb"
                                    />
                                    <span className="admin-poem-title">
                                        {item.caption || <em style={{ color: "var(--text-muted)" }}>Без подписи</em>}
                                    </span>
                                    <div className="admin-poem-actions">
                                        <button className="btn btn-sm" onClick={() => openEditGallery(item)}>
                                            Изменить
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteGallery(item.id)}>
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
