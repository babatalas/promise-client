import { ReactNode } from "react";
import Typography from "@material-ui/core/Typography";

interface Props {
  children: ReactNode;
}

const FieldTitle = ({ children }: Props) => {
  return (
    <Typography component="h3" variant="h6" color="primary" gutterBottom>
      {children}
    </Typography>
  );
};

export default FieldTitle;
