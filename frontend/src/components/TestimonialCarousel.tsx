import { testimonials } from "../data/content";

export function TestimonialCarousel(): JSX.Element {
  const track = [...testimonials, ...testimonials];

  return (
    <div className="testimonial-shell reveal-up">
      <div className="testimonial-track" aria-label="Depoimentos de clientes">
        {track.map((testimonial, index) => (
          <article className="testimonial-card" key={`${testimonial.name}-${index}`}>
            <div className="testimonial-card__head">
              <span className="avatar" aria-hidden="true">
                {testimonial.avatar}
              </span>
              <div>
                <h3>{testimonial.name}</h3>
                <p aria-label={`${testimonial.rating} estrelas`}>★★★★★</p>
              </div>
            </div>
            <blockquote>{testimonial.text}</blockquote>
          </article>
        ))}
      </div>
    </div>
  );
}
