from .database import Base, engine, SessionLocal
from .models_db import Book

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_books():
    db = SessionLocal()
    books = [
        {
            "title": "Romeo and Juliet",
            "author": "William Shakespeare",
            "year": 1998,
            "description": "A tragedy by William Shakespeare about two teenage lovers, Romeo and Juliet, whose passionate love is tragically cut short due to the intense feud between their families, the Capulets and the Montagues. The play explores themes of love, fate, and the consequences of unchecked hatred, ultimately highlighting how the families' conflict leads to the lovers' deaths and a reconciliation between the families.",
            "cover_url": "https://m.media-amazon.com/images/I/61LQf6GWT4L.jpg",
            "pdf_url": "https://www.pdfbooksworld.com/bibi/pre.html?book=52.epub"
        },
        {
            "title": "The Call Of The Wild",
            "author": "Jack London",
            "year": 1960,
            "description": "A novel by Jack London, is the story of Buck, a domesticated dog, who is stolen from his comfortable life in California and sold as a sled dog in the harsh Alaskan wilderness during the Klondike Gold Rush. Buck's journey is about his transformation from a pet to a wild dog, as he learns to survive through primal instincts and fierce competition. The story explores themes of survival, nature, and the human-animal relationship. ",
            "cover_url": "https://www.pdfbooksworld.com/image/cache/catalog/51-250x350.jpg",
            "pdf_url": "https://www.pdfbooksworld.com/bibi/pre.html?book=51.epub"
        },
        {
            "title": "Anna Karenina",
            "author": "Graf Leo Tolstoy",
            "year": 1878,
            "description": "Anna Karenina is a novel by Russian author Graf Leo Tolstoy. The story of woman, who once mediated to solve family problems on account of adulteries of his brother, fall herself in a similar situation later. Anna Karenina, wife of Karenin a statesman. Infatuated, fell in love and later married to a young cavalry officer, Anna’s activities are considered as disgraceful by the society. Her plea for divorce, from her husband is realized in an ironical situation.",
            "cover_url": "https://www.pdfbooksworld.com/image/cache/catalog/60-500x500.jpg",
            "pdf_url": "https://www.pdfbooksworld.com/bibi/pre.html?book=60.epub"
        },
        {
            "title": "The War of the Worlds",
            "author": "H. G. Wells",
            "year": 1878,
            "description": "The war of the worlds is a science fiction novel by H.G.Wells. Martians came, conquered and finally succumbed to bacterias. We, the humans think, we are the king of the earth over all living creatures. This novel breaks our thinking of supremacy over the earth. This science fiction is written in two parts as the invasion (The coming of the Martians) and Control (The Earth under the Martians) by the Martians over the earth. In fact this novel was published, when human were not equipped to fly.",
            "cover_url": "https://www.pdfbooksworld.com/image/cache/catalog/66-500x500.jpg",
            "pdf_url": "https://www.pdfbooksworld.com/bibi/pre.html?book=66.epub"
        },
        {
            "title": "The Adventures of Sherlock Holmes",
            "author": "Arthur Conan Doyle",
            "year": 1878,
            "description": "The adventures of Sherlock Holmes is a collection of 12 detective fiction stories by Arthur Conan Doyle.  An inevitable collection of Adventure stories, without which our library would miss the action packed thriller moments of the world famous Sherlock Holmes. It is hard to believe Holmes is only a fictitious character, not a living man. Penned by Conan and published as series of short stories, these detective collections made a huge fortune to the then Strand Magazine for months.",
            "cover_url": "https://www.pdfbooksworld.com/image/cache/catalog/54-250x350.jpg",
            "pdf_url": "https://www.pdfbooksworld.com/bibi/pre.html?book=54.epub"
        },
        {
            "title": "The Little Lady of the Big House",
            "author": "Jack London",
            "year": 1915,
            "description": "A triangle love story written in an autobiographical style comprises of the key characters of a rancher, his wife and a mutual friend. Key characters are Dick Forrest, his wife Paula and Charmian. Paula and Charmian has identical problems with their personality. Both of them suffer from insomnia and they cannot bear children.",
            "cover_url": "https://www.pdfbooksworld.com/image/cache/catalog/57-250x350.jpg",
            "pdf_url": "https://www.pdfbooksworld.com/bibi/pre.html?book=57.epub"
        },
        {
            "title": "A Tale of Two Cities",
            "author": "Charles Dickens",
            "year": 1859,
            "description": "The novel tells the story of the French Doctor Manette, his 18-year-long imprisonment in the Bastille in Paris, and his release to live in London with his daughter Lucie whom he had never met. The story is set against the conditions that led up to the French Revolution and the Reign of Terror.",
            "cover_url": "https://www.pdfbooksworld.com/image/cache/catalog/67-250x350.jpg",
            "pdf_url": "https://www.pdfbooksworld.com/bibi/pre.html?book=67.epub"
        },
        {
            "title": "Peter and Wendy",
            "author": "Charles Dickens",
            "year": 1859,
            "description": "Peter and Wendy is a fantasy novel by James Mathew Barrie. It is believed that this story was conceived by the author in his mother’s ever loving memory of his elder brother who died at the age of 13. Hence in his mother’s mind the boy never grown up. A boy who enjoys his childhood and unwilling to transform himself to adulthood is the theme behind this fiction story. Peter Pan, the lead character loves to listen to bedtime stories and lives in a Neverland, a fictitious island along with other boys. One day he invites her sister Wendy to his Neverland and asks her to be mother of the boys. They build a house for Wendy which is attacked by pirates. In an earlier incident Peter has won the heart of Indians, who help him later combating against the pirates. This novel is later transformed to a Oedipus like complex developed by Wendy who loves Peter, however Peter always wish, Wendy to be his mother only.",
            "cover_url": "https://www.pdfbooksworld.com/image/cache/catalog/59-250x350.jpg",
            "pdf_url": "https://www.pdfbooksworld.com/bibi/pre.html?book=59.epub"
        },
    ]

    for b in books:
        existing = db.query(Book).filter(Book.title == b["title"]).first()
        if not existing:
            book = Book(**b)
            db.add(book)

    db.commit()
    db.close()
