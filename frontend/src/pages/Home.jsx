import { useEffect, useState } from "react";
import { getSiteContent } from "../api/siteContent";
import authorPhoto from "./photos/5231371326352727703.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const DEFAULTS = {
    hero_name: "",
    hero_tagline: "",
    hero_description: "",
    awards: "",
    bio_1: "",
    bio_2: "",
    contact_email: "",
    contact_note: "",
};

export default function Home() {
    const [content, setContent] = useState(DEFAULTS);

    useEffect(() => {
        getSiteContent()
            .then((r) => setContent({ ...DEFAULTS, ...r.data }))
            .catch(() => {});
    }, []);

    const awards = content.awards
        ? content.awards.split("\n").filter(Boolean)
        : [];

    return (
        <div className="container">

            <div className="hero">
                <img
                    className="hero-photo"
                    src={content.hero_photo ? API_URL + content.hero_photo : authorPhoto}
                    alt="Фото автора"
                />
                <div className="hero-content">
                    <h1>{content.hero_name}</h1>
                    <p className="hero-tagline">{content.hero_tagline}</p>
                    <p style={{ whiteSpace: "pre-line" }}>{content.hero_description}</p>
                </div>
            </div>

            {awards.length > 0 && (
                <div className="section">
                    <h2 className="section-title">Награды и достижения</h2>
                    <ul className="awards-list">
                        {awards.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                </div>
            )}

            {(content.bio_1 || content.bio_2) && (
                <div className="section">
                    <h2 className="section-title">Биография</h2>
                    {content.bio_1 && <p className="bio-text">{content.bio_1}</p>}
                    {content.bio_2 && <><br /><p className="bio-text">{content.bio_2}</p></>}
                </div>
            )}

            <hr className="divider" />

            <div className="section">
                <h2 className="section-title">Контакты</h2>
                <div className="contact-block">
                    <p>По вопросам публикаций и выступлений:</p>
                    {content.contact_email && (
                        <p>Email: <a href={`mailto:${content.contact_email}`}>{content.contact_email}</a></p>
                    )}
                    {content.contact_note && <p style={{ whiteSpace: "pre-line" }}>{content.contact_note}</p>}
                </div>
            </div>

        </div>
    );
}
