import React from "react";
import "./BookModal.css";

function BookModal({ isOpen, onClose, onSubmit, isEdit, formData, setFormData }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      cover_url:
        !formData.cover_url || formData.cover_url.trim() === ""
          ? "https://bookshow.blurb.com/bookshow/cache/P11360640/md/cover_2.jpeg?access_key=675523b769268bce5b0b710b3d0e7841"
          : formData.cover_url,
    };
    onSubmit(finalData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isEdit ? "Edit Book" : "Add New Book"}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            required
          />
          <input
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Author"
            required
          />
          <input
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="Year"
            required
            type="number"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="description"
            rows={2}
            className="modal-textarea"
          />
          <input
            name="cover_url"
            value={formData.cover_url || ""}
            onChange={handleChange}
            placeholder="Cover URL"
          />
          <input
            name="pdf_url"
            value={formData.pdf_url || ""}
            onChange={handleChange}
            placeholder="PDF URL"
          />

          <div className="modal-buttons">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookModal;