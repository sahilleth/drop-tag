import { Navigate, useParams } from "react-router-dom";

const RoomShortLinkRedirect = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  if (!hashtag) {
    return <Navigate to="/" replace />;
  }
  return <Navigate to={`/room/${hashtag}/files`} replace />;
};

export default RoomShortLinkRedirect;

