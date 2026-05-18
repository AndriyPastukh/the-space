import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { useCategories } from "../../hooks/useCategories";
import { usersApi } from "../../features/users/usersApi";
import AvatarUpload from "../CreateSpacePage/components/shared/AvatarUpload/AvatarUpload";
import MultiSelect from "../../components/MultiSelect/MultiSelect";
import "../CreatePage/CreateExperiencePage.css";

export default function EditProfilePage() {
    const navigate = useNavigate();
    const { user, isAuthLoading } = useAuth();
    const { profile, isLoading: isProfileLoading, refetch } = useProfile();
    const { categories } = useCategories();

    // Form fields
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [nickname, setNickname] = useState("");
    const [bio, setBio] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [status, setStatus] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [skillTagsStr, setSkillTagsStr] = useState("");
    const [interestTagsStr, setInterestTagsStr] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<(string | number)[]>([]);

    // Avatar state
    const [avatarUrl, setAvatarUrl] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // Social Links state
    const [githubUrl, setGithubUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [facebookUrl, setFacebookUrl] = useState("");

    // UI states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState("");

    // Prefill form
    useEffect(() => {
        if (profile) {
            setFirstName(profile.firstName || "");
            setMiddleName(profile.middleName || "");
            setLastName(profile.lastName || "");
            setNickname(profile.nickname || "");
            setBio(profile.bio || "");
            setPhoneNumber(profile.phoneNumber || "");
            setStatus(profile.status || "");
            setCountry(profile.location?.country || "");
            setCity(profile.location?.city || "");
            setAvatarUrl(profile.avatarUrl || "");

            // Tags
            setSkillTagsStr(profile.tags?.skills?.join(", ") || "");
            setInterestTagsStr(profile.tags?.interests?.join(", ") || "");

            // Categories
            setSelectedCategories(profile.categories?.map((c: any) => c.id) || []);

            // Social links
            const github = profile.socialLinks?.find((sl: any) => sl.platform.toLowerCase().includes("github"))?.url || "";
            const linkedin = profile.socialLinks?.find((sl: any) => sl.platform.toLowerCase().includes("linkedin"))?.url || "";
            const facebook = profile.socialLinks?.find((sl: any) => sl.platform.toLowerCase().includes("facebook"))?.url || "";
            setGithubUrl(github);
            setLinkedinUrl(linkedin);
            setFacebookUrl(facebook);
        }
    }, [profile]);

    if (isAuthLoading || isProfileLoading) {
        return (
            <div className="form-page">
                <div className="form-container">
                    <p className="loading-text">Завантаження...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="form-page">
                <div className="form-container">
                    <div className="message error">Будь ласка, авторизуйтесь для редагування профілю.</div>
                </div>
            </div>
        );
    }

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!firstName.trim()) errors.firstName = "Ім'я обов'язкове";
        if (!lastName.trim()) errors.lastName = "Прізвище обов'язкове";
        if (!nickname.trim()) errors.nickname = "Нікнейм обов'язковий";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setFormError("");
        setSuccessMessage("");

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            let finalAvatarUrl = avatarUrl;

            // Upload avatar if a file was selected
            if (avatarFile) {
                const { uploadUrl, publicUrl } = await usersApi.getAvatarPresignedUrl(avatarFile.type);
                await fetch(uploadUrl, {
                    method: "PUT",
                    body: avatarFile,
                    headers: {
                        "Content-Type": avatarFile.type,
                    },
                });
                finalAvatarUrl = publicUrl;
            }

            // Prepare tags
            const skillTags = skillTagsStr
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0);

            const interestTags = interestTagsStr
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0);

            // Prepare social links
            const socialLinks: { platform: string; url: string }[] = [];
            if (githubUrl.trim()) socialLinks.push({ platform: "GitHub", url: githubUrl.trim() });
            if (linkedinUrl.trim()) socialLinks.push({ platform: "LinkedIn", url: linkedinUrl.trim() });
            if (facebookUrl.trim()) socialLinks.push({ platform: "Facebook", url: facebookUrl.trim() });

            // Prepare payload
            const payload = {
                firstName: firstName.trim(),
                middleName: middleName.trim() || undefined,
                lastName: lastName.trim(),
                nickname: nickname.trim(),
                avatarUrl: finalAvatarUrl || undefined,
                bio: bio.trim() || undefined,
                phoneNumber: phoneNumber.trim() || undefined,
                status: status.trim() || undefined,
                country: country.trim() || undefined,
                city: city.trim() || undefined,
                skillTags,
                interestTags,
                categories: selectedCategories.map(Number),
                socialLinks,
            };

            await usersApi.updateMyProfile(payload);
            setSuccessMessage("Профіль успішно оновлено!");
            await refetch();

            setTimeout(() => {
                navigate("/profile");
            }, 1000);
        } catch (err: any) {
            console.error("Failed to update profile:", err);
            const errMsg = err?.response?.data?.message || "Не вдалося оновити профіль. Перевірте введені дані.";
            setFormError(Array.isArray(errMsg) ? errMsg.join(", ") : errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-page">
            <div className="form-container">
                <div className="create-header">
                    <h1 className="form-title create-title">Редагувати профіль</h1>
                </div>

                {formError && <div className="message error">{formError}</div>}
                {successMessage && <div className="message success">{successMessage}</div>}

                <form className="form-box form-stack" onSubmit={handleSubmit} noValidate>
                    {/* Avatar Block */}
                    <div className="form-group">
                        <label className="form-label">Аватар профілю</label>
                        <AvatarUpload
                            file={avatarFile}
                            onChange={setAvatarFile}
                            error={fieldErrors.avatar}
                        />
                        {avatarUrl && !avatarFile && (
                            <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <img
                                    src={avatarUrl}
                                    alt="Current Avatar"
                                    style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
                                />
                                <span className="text-sm-muted">Поточний аватар</span>
                            </div>
                        )}
                    </div>

                    {/* Name Fields */}
                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        <div className="form-group">
                            <label className="form-label">Ім'я <span className="required">*</span></label>
                            <input
                                className={`form-input ${fieldErrors.firstName ? "form-input--error" : ""}`}
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                disabled={isSubmitting}
                            />
                            {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">По батькові</label>
                            <input
                                className="form-input"
                                type="text"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Прізвище <span className="required">*</span></label>
                            <input
                                className={`form-input ${fieldErrors.lastName ? "form-input--error" : ""}`}
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                disabled={isSubmitting}
                            />
                            {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
                        </div>
                    </div>

                    {/* Nickname */}
                    <div className="form-group">
                        <label className="form-label">Нікнейм <span className="required">*</span></label>
                        <input
                            className={`form-input ${fieldErrors.nickname ? "form-input--error" : ""}`}
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            disabled={isSubmitting}
                            placeholder="Username"
                        />
                        {fieldErrors.nickname && <span className="field-error">{fieldErrors.nickname}</span>}
                    </div>

                    {/* Location */}
                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="form-group">
                            <label className="form-label">Країна</label>
                            <input
                                className="form-input"
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Україна"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Місто</label>
                            <input
                                className="form-input"
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Київ"
                            />
                        </div>
                    </div>

                    {/* Phone & Status */}
                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="form-group">
                            <label className="form-label">Телефон</label>
                            <input
                                className="form-input"
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="+380..."
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Статус профілю</label>
                            <input
                                className="form-input"
                                type="text"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Шукаю нові виклики..."
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="form-group">
                        <label className="form-label">Про себе</label>
                        <textarea
                            className="form-input form-textarea"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Розкажіть трохи про свій професійний досвід, навички..."
                            rows={4}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Categories Multi-selection */}
                    <div className="form-group">
                        <label className="form-label">Напрями досвіду / Сфери інтересів</label>
                        <MultiSelect
                            options={categories}
                            selected={selectedCategories}
                            onChange={setSelectedCategories}
                            placeholder="Оберіть категорії..."
                        />
                    </div>

                    {/* Skills & Interests Comma-separated Inputs */}
                    <div className="form-group">
                        <label className="form-label">Навички (через кому)</label>
                        <input
                            className="form-input"
                            type="text"
                            value={skillTagsStr}
                            onChange={(e) => setSkillTagsStr(e.target.value)}
                            placeholder="React, NestJS, CSS, Figma"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Інтереси (через кому)</label>
                        <input
                            className="form-input"
                            type="text"
                            value={interestTagsStr}
                            onChange={(e) => setInterestTagsStr(e.target.value)}
                            placeholder="Стартапи, Штучний інтелект, Подорожі"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Social links */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600, color: "var(--text)", marginBottom: "12px" }}>Соціальні мережі</label>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ width: "80px", fontSize: "14px", color: "var(--text-muted)" }}>GitHub:</span>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    placeholder="https://github.com/your-username"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ width: "80px", fontSize: "14px", color: "var(--text-muted)" }}>LinkedIn:</span>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    placeholder="https://linkedin.com/in/your-profile"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ width: "80px", fontSize: "14px", color: "var(--text-muted)" }}>Facebook:</span>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={facebookUrl}
                                    onChange={(e) => setFacebookUrl(e.target.value)}
                                    placeholder="https://facebook.com/your-profile"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit and Cancel Buttons */}
                    <div className="form-actions" style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => navigate("/profile")}
                            disabled={isSubmitting}
                            style={{ flex: 1 }}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            style={{ flex: 2 }}
                        >
                            {isSubmitting ? "Збереження..." : "Зберегти зміни"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
