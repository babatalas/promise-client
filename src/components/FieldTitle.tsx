import { ReactNode } from "react";
import Typography from "@material-ui/core/Typography";

interface Props {
  children: ReactNode;
}

const FieldTitle = ({ children }: Props) => {
  return (
    <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
      {children}
    </Typography>
  );
};

export default FieldTitle;
