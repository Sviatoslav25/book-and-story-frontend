import { Card, Container, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import useAPIQuery from '../hooks/useAPIQuery';
import style from '../pagesStyle/BookDetails.module.scss';
import APIService from '../services/APIService';

export default function BookDetails() {
  const params = useParams();
  const [book, , isLoading, error] = useAPIQuery({ call: APIService.getBook(params.id) });

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error.message}</Alert>
      </Container>
    );
  }
  return (
    <>
      <Container className="mt-4">
        {isLoading || !book ? (
          'loading...'
        ) : (
          <Card>
            <Card.Img className={style.bookImage} alt={`${book.name} image`} variant="top" src={book.img} />
            <Card.Body>
              <Card.Title>{book.name}</Card.Title>
              <Card.Text>Description:{book.description}</Card.Text>
              <Card.Text>
                Authors:
                {book.otherAuthors.map((item) => {
                  return item;
                })}
              </Card.Text>
              <a href={book.bookSrc}>Book</a>
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
}
