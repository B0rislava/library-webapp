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
      cover_url: formData.cover_url.trim() || "https://bookshow.blurb.com/bookshow/cache/P11360640/md/cover_2.jpeg?access_key=675523b769268bce5b0b710b3d0e7841",
    };
    onSubmit(finalData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? "Edit Book" : "Add New Book"}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter book title"
              required
            />
          </div>

          <div className="form-group">
            <label>Author</label>
            <input
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Enter author name"
              required
            />
          </div>

          <div className="form-group">
            <label>Year</label>
            <input
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="Publication year"
              required
              type="number"
              min="0"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter book description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Cover Image URL</label>
            <input
              name="cover_url"
              value={formData.cover_url || ""}
              onChange={handleChange}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div className="form-group">
            <label>PDF URL</label>
            <input
              name="pdf_url"
              value={formData.pdf_url || ""}
              onChange={handleChange}
              placeholder="https://example.com/book.pdf"
            />
          </div>

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {isEdit ? "Update Book" : "Add Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookModal;