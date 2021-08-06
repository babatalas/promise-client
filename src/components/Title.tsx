import { ReactNode } from "react";
import Typography from "@material-ui/core/Typography";

interface Props {
  children: ReactNode;
}

const Title = ({ children }: Props) => {
  return (
    <Typography
      style={{ marginBottom: 30 }}
      component="h2"
      variant="h6"
      color="primary"
      gutterBottom
    >
      {children}
    </Typography>
  );
};

export default Title;
