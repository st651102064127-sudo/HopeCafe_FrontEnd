const Card = ({ children, title }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      {title && <h3 className="text-lg font-semibold mb-2 text-yellow-800">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
