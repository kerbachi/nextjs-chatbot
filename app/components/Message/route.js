export const Message = ({ role, content }) => {
  return (
    <div className="flex flex-row gap-4 items-center">
      <div>{role}</div>
      <div>{content}</div>
    </div>
  );
};
