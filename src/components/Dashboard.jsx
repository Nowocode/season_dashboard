import React, { useState, useEffect } from 'react';
import {
    Plus,
    List,
    ClipboardList,
    CheckCircle2,
    Edit2,
    X,
    ChevronDown,
    ChevronUp,
    LogOut,
    Trash2
} from 'lucide-react';
import { db } from '../firebase.jsx';
import { feedbackService } from '../services/feedbackService.jsx';
import { authService } from '../services/authService.jsx';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('feedbacks'); // 'feedbacks', 'responses', 'create'
    const [feedbacks, setFeedbacks] = useState([]);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingFeedback, setEditingFeedback] = useState(null);

    useEffect(() => {
        fetchData();
        // Also fetch other collections to keep stats accurate
        if (activeTab === 'feedbacks') {
            fetchResponsesOnly();
        }
        if (activeTab === 'responses') {
            fetchFeedbacksOnly();
        }
    }, [activeTab]);

    const fetchFeedbacksOnly = async () => {
        try {
            const data = await feedbackService.getFeedbacks();
            setFeedbacks(data);
        } catch (e) { }
    };

    const fetchResponsesOnly = async () => {
        try {
            const data = await feedbackService.getResponses();
            setResponses(data);
        } catch (e) { }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log("fetching data for tab:", activeTab);
            if (activeTab === 'feedbacks') {
                const data = await feedbackService.getFeedbacks();
                console.log("Setting feedbacks state:", data);
                setFeedbacks(data);
            } else if (activeTab === 'responses') {
                const data = await feedbackService.getResponses();
                console.log("Setting responses state:", data);
                setResponses(data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    const handleToggleAvailable = async (id) => {
        await feedbackService.setAvailable(id);
        fetchData();
    };

    const handleDeleteFeedback = async (id) => {
        if (window.confirm("Are you sure you want to delete this feedback?")) {
            await feedbackService.deleteFeedback(id);
            fetchData();
        }
    };

    const handleEdit = (feedback) => {
        setEditingFeedback(feedback);
        setActiveTab('create');
    };

    const handleCreateNew = () => {
        setEditingFeedback(null);
        setActiveTab('create');
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="app-container">
            <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
                <h1 className="responsive-title" style={{
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    color: 'var(--primary)',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase'
                }}>
                    Season Feedback Central
                </h1>
            </header>

            <div className="stats-grid">
                <div className="glass-card stat-card animate-fade delay-1">
                    <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        <List size={24} />
                    </div>
                    <span className="stat-value">{feedbacks.length}</span>
                    <span className="stat-label">Total Feedbacks</span>
                </div>
                <div className="glass-card stat-card animate-fade delay-2">
                    <div style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                        <ClipboardList size={24} />
                    </div>
                    <span className="stat-value">{responses.length}</span>
                    <span className="stat-label">Total Responses</span>
                </div>
            </div>

            <nav className="glass-card nav-wrap animate-fade delay-4">
                <button
                    className={`btn btn-ghost ${activeTab === 'feedbacks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feedbacks')}
                >
                    <List size={18} /> Feedbacks
                </button>
                <button
                    className={`btn btn-ghost ${activeTab === 'responses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('responses')}
                >
                    <ClipboardList size={18} /> Responses
                </button>
                <div className="flex-spacer"></div>
                <button
                    className={`btn btn-primary ${activeTab === 'create' && !editingFeedback ? 'active' : ''}`}
                    onClick={handleCreateNew}
                >
                    <Plus size={18} /> Create New
                </button>
                <button
                    className="btn btn-ghost"
                    onClick={handleLogout}
                    title="Sign Out"
                >
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <main>
                {activeTab === 'feedbacks' && (
                    <FeedbackList
                        feedbacks={feedbacks}
                        loading={loading}
                        onToggleAvailable={handleToggleAvailable}
                        onEdit={handleEdit}
                        onDelete={handleDeleteFeedback}
                    />
                )}
                {activeTab === 'responses' && (
                    <ResponseList responses={responses} loading={loading} />
                )}
                {activeTab === 'create' && (
                    <FeedbackForm
                        key={editingFeedback?.id || 'new'}
                        initialData={editingFeedback}
                        onSuccess={() => {
                            setEditingFeedback(null);
                            setActiveTab('feedbacks');
                        }}
                        onCancel={() => {
                            setEditingFeedback(null);
                            setActiveTab('feedbacks');
                        }}
                    />
                )}
            </main>
        </div>
    );
};

const FeedbackList = ({ feedbacks, loading, onToggleAvailable, onEdit, onDelete }) => {
    if (loading) return <div className="animate-fade">Loading feedbacks...</div>;

    if (feedbacks.length === 0) {
        return (
            <div className="glass-card animate-fade" style={{ textAlign: 'center', padding: '3rem' }}>
                <List size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>No feedback surveys found.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
            {feedbacks.map((f, idx) => (
                <div
                    key={f.id}
                    className={`glass-card card-flex animate-fade delay-${(idx % 5) + 1}`}
                >
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0 }}>{f.title_en}</h3>
                        <p style={{ margin: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{f.description_en}</p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', alignItems: 'center' }}>
                            <span>{f.questions?.length || 0} Questions</span>
                            {f.isAvailable && <span className="badge badge-success"><CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Active</span>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn btn-ghost"
                            onClick={() => onEdit(f)}
                            title="Edit Feedback"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={() => onDelete(f.id)}
                            title="Delete Feedback"
                            style={{ color: '#ef4444' }}
                        >
                            <Trash2 size={16} />
                        </button>
                        <button
                            className={`btn ${f.isAvailable ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => onToggleAvailable(f.id)}
                            disabled={f.isAvailable}
                        >
                            {f.isAvailable ? 'Currently Active' : 'Set Active'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ResponseCard = ({ response: r, idx }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const renderValue = (val) => {
        if (val === null || val === undefined) return 'N/A';
        if (typeof val === 'object' && 'value' in val) return renderValue(val.value);
        if (typeof val === 'object' && !Array.isArray(val)) {
            return Object.entries(val)
                .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                .join(', ');
        }
        if (Array.isArray(val)) return val.map(v => renderValue(v)).join(', ');
        return String(val);
    };

    return (
        <div className={`glass-card animate-fade delay-${(idx % 5) + 1}`}>
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    paddingBottom: isExpanded ? '0.75rem' : '0',
                    borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                    marginBottom: isExpanded ? '0.75rem' : '0',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{r.email}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : ''}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {r.id}</span>
                    {isExpanded ? <ChevronUp size={20} color="var(--primary)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </div>
            </div>

            {isExpanded && (
                <div className="animate-fade" style={{ animationDuration: '0.3s' }}>
                    <div style={{ fontSize: '0.9rem' }}>
                        {r.response && typeof r.response === 'object' && !Array.isArray(r.response) ? (
                            Object.entries(r.response).map(([key, val]) => (
                                <div key={key} style={{
                                    marginBottom: '1rem',
                                    padding: '1rem',
                                    background: 'var(--bg)',
                                    borderRadius: '0.75rem',
                                    borderLeft: '4px solid var(--primary)'
                                }}>
                                    <span style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {key.replace(/_/g, ' ')}
                                    </span>
                                    <div style={{ color: 'var(--text)', fontWeight: 500, fontSize: '1rem' }}>{renderValue(val)}</div>
                                </div>
                            ))
                        ) : Array.isArray(r.response) ? (
                            r.response.map((entry, idx) => (
                                <div key={idx} style={{ marginBottom: '1.5rem', borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                                    {Object.entries(entry).map(([key, val]) => (
                                        <div key={key} style={{
                                            marginBottom: '1rem',
                                            padding: '1rem',
                                            background: 'var(--bg)',
                                            borderRadius: '0.75rem',
                                            borderLeft: '4px solid var(--secondary)'
                                        }}>
                                            <span style={{ color: 'var(--secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <div style={{ color: 'var(--text)', fontWeight: 500, fontSize: '1rem' }}>{renderValue(val)}</div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Malformed response data</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ResponseList = ({ responses, loading }) => {
    if (loading) return <div className="animate-fade">Loading responses...</div>;

    if (responses.length === 0) {
        return (
            <div className="glass-card animate-fade" style={{ textAlign: 'center', padding: '3rem' }}>
                <ClipboardList size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>No responses collected yet.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
            {responses.map((r, idx) => (
                <ResponseCard response={r} idx={idx} key={r.id} />
            ))}
        </div>
    );
};

const FeedbackForm = ({ initialData, onSuccess, onCancel }) => {
    const isEdit = !!initialData;
    const [titleEn, setTitleEn] = useState(initialData?.title_en || initialData?.title || '');
    const [titleDe, setTitleDe] = useState(initialData?.title_de || '');
    const [descriptionEn, setDescriptionEn] = useState(initialData?.description_en || initialData?.description || '');
    const [descriptionDe, setDescriptionDe] = useState(initialData?.description_de || '');

    // Map initial questions to new structure if needed
    const [questions, setQuestions] = useState(() => {
        if (initialData?.questions) {
            return initialData.questions.map(q => ({
                ...q,
                questionText_en: q.questionText_en || q.questionText || '',
                questionText_de: q.questionText_de || '',
                options_en: q.options_en || q.options || [],
                options_de: q.options_de || (q.options ? new Array(q.options.length).fill('') : []), // Fallback to empty strings if migrating
            }));
        }
        return [{
            id: Date.now().toString(),
            questionText_en: '',
            questionText_de: '',
            type: 'free_text',
            includeText: false,
            options_en: [],
            options_de: []
        }];
    });

    const addQuestion = () => {
        setQuestions([...questions, {
            id: Date.now().toString(),
            questionText_en: '',
            questionText_de: '',
            type: 'free_text',
            includeText: false,
            options_en: [],
            options_de: []
        }]);
    };

    const removeQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleQuestionChange = (id, field, value) => {
        setQuestions(questions.map(q => {
            if (q.id !== id) return q;

            if (field === 'type' && value === 'yes_no_text') {
                return {
                    ...q,
                    [field]: value,
                    includeText: false,
                    options_en: ['Yes', 'No'],
                    options_de: ['Ja', 'Nein']
                };
            }

            return { ...q, [field]: value };
        }));
    };

    const addOption = (questionId) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    options_en: [...(q.options_en || []), ''],
                    options_de: [...(q.options_de || []), '']
                };
            }
            return q;
        }));
    };

    const handleOptionChange = (questionId, optionIdx, value, lang) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const key = lang === 'en' ? 'options_en' : 'options_de';
                const newOptions = [...q[key]];
                newOptions[optionIdx] = value;
                return { ...q, [key]: newOptions };
            }
            return q;
        }));
    };

    const removeOption = (questionId, optionIdx) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const newOptionsEn = q.options_en.filter((_, idx) => idx !== optionIdx);
                const newOptionsDe = q.options_de.filter((_, idx) => idx !== optionIdx);
                return { ...q, options_en: newOptionsEn, options_de: newOptionsDe };
            }
            return q;
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const feedbackData = {
            title_en: titleEn,
            title_de: titleDe,
            description_en: descriptionEn,
            description_de: descriptionDe,
            questions: questions.filter(q => q.questionText_en.trim()).map(q => ({
                id: q.id,
                type: q.type,
                questionText_en: q.questionText_en,
                questionText_de: q.questionText_de,
                includeText: q.type === 'yes_no_text' ? !!q.includeText : false,
                options_en: q.options_en,
                options_de: q.options_de
            }))
        };

        if (isEdit) {
            await feedbackService.updateFeedback(initialData.id, feedbackData);
        } else {
            await feedbackService.createFeedback(feedbackData);
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card animate-fade" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>{isEdit ? 'Edit Feedback (EN/DE)' : 'Create New Feedback (EN/DE)'}</h2>
                <button type="button" className="btn btn-ghost" onClick={onCancel}>
                    <X size={20} />
                </button>
            </div>

            {/* Title Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Title (English)</label>
                    <input
                        className="input"
                        value={titleEn}
                        onChange={(e) => setTitleEn(e.target.value)}
                        placeholder="e.g., Summer Survey"
                        required
                    />
                </div>
                <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Title (German)</label>
                    <input
                        className="input"
                        value={titleDe}
                        onChange={(e) => setTitleDe(e.target.value)}
                        placeholder="z.B. Sommer Umfrage"
                        required
                    />
                </div>
            </div>

            {/* Description Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Description (English)</label>
                    <textarea
                        className="input"
                        style={{ height: '80px', resize: 'none' }}
                        value={descriptionEn}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                        placeholder="Survey description..."
                        required
                    />
                </div>
                <div>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Description (German)</label>
                    <textarea
                        className="input"
                        style={{ height: '80px', resize: 'none' }}
                        value={descriptionDe}
                        onChange={(e) => setDescriptionDe(e.target.value)}
                        placeholder="Umfrage Beschreibung..."
                        required
                    />
                </div>
            </div>

            {/* Questions Section */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Questions</h3>
                    <button type="button" className="btn btn-ghost" onClick={addQuestion} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <Plus size={16} /> Add Question
                    </button>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {questions.map((q, idx) => (
                        <div key={q.id} className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start' }}>
                                <span style={{ fontWeight: 600, color: 'var(--primary)', marginTop: '0.5rem' }}>Question #{idx + 1}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '180px' }}>
                                            <select
                                                className="input"
                                                value={q.type}
                                                onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value)}
                                                style={{ padding: '0.4rem', marginBottom: 0 }}
                                            >
                                                <option value="free_text">Free Text</option>
                                                <option value="multiple_choice">Multiple Choice</option>
                                                <option value="yes_no_text">Yes/No</option>
                                            </select>
                                        </div>
                                        <button type="button" className="btn btn-ghost" onClick={() => removeQuestion(q.id)} style={{ padding: '0.5rem' }}>
                                            <Trash2 size={16} color="#ef4444" />
                                        </button>
                                    </div>
                                    {q.type === 'yes_no_text' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Include Text Field</span>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={q.includeText}
                                                    onChange={(e) => handleQuestionChange(q.id, 'includeText', e.target.checked)}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Question (EN)</label>
                                    <input
                                        className="input"
                                        value={q.questionText_en}
                                        onChange={(e) => handleQuestionChange(q.id, 'questionText_en', e.target.value)}
                                        placeholder="Question in English"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Question (DE)</label>
                                    <input
                                        className="input"
                                        value={q.questionText_de}
                                        onChange={(e) => handleQuestionChange(q.id, 'questionText_de', e.target.value)}
                                        placeholder="Frage auf Deutsch"
                                        required
                                    />
                                </div>
                            </div>

                            {(q.type === 'multiple_choice' || q.type === 'yes_no_text') && (
                                <div style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border)' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                                        {q.type === 'yes_no_text' ? 'Options (Yes/No)' : 'Options (EN / DE)'}
                                    </label>
                                    {q.options_en?.map((opt, optIdx) => (
                                        <div key={optIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                            <input
                                                className="input"
                                                style={{ padding: '0.4rem' }}
                                                value={opt}
                                                onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value, 'en')}
                                                placeholder={`Option ${optIdx + 1} (EN)`}
                                                required
                                            />
                                            <input
                                                className="input"
                                                style={{ padding: '0.4rem' }}
                                                value={q.options_de?.[optIdx] || ''}
                                                onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value, 'de')}
                                                placeholder={`Option ${optIdx + 1} (DE)`}
                                                required
                                            />
                                            <button type="button" className="btn btn-ghost" onClick={() => removeOption(q.id, optIdx)} style={{ padding: '0.4rem' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" className="btn btn-ghost" onClick={() => addOption(q.id)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                                        + Add Option pair
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', height: '3rem' }}>
                    {isEdit ? 'Update Feedback' : 'Create Feedback Survey'}
                </button>
            </div>
        </form>
    );
};

export default Dashboard;
