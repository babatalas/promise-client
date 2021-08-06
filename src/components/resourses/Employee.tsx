import { FC, useCallback, useEffect, useState } from "react";
import { useLocation, Link, useHistory, useParams } from "react-router-dom";
import { Formik, Field, Form, useField, FieldAttributes } from "formik";
import * as yup from "yup";
import {
  Button,
  Grid,
  Paper,
  IconButton,
  FormControlLabel,
  TextField,
  Radio,
  Select,
  MenuItem,
  FormHelperText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Title from "../Title";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridValueGetterParams,
} from "@material-ui/data-grid";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddBoxIcon from "@material-ui/icons/AddBox";
import SaveIcon from "@material-ui/icons/Save";
import UndoIcon from "@material-ui/icons/Undo";
import { Skeleton } from "@material-ui/lab";
import Swal from "sweetalert2";
import FieldTitle from "../FieldTitle";

type CreateEmployeeDto = {
  name: string;
  birthDate: string;
  idNumber: number;
  gender: number;
  position: number;
  isDelete: number;
};

type Position = {
  id: number;
  name: string;
  code: string;
  isDelete: number;
};
type Employee = CreateEmployeeDto & {
  id: number;
  position: Position;
};

const validationSchema = yup.object({
  name: yup.string().required(`Name is a required field`).min(3),
  birthDate: yup.string().required(`Birth date is a required field`),
  idNumber: yup
    .number()
    .required(`NIP is a required field`)
    .positive()
    .max(2147483647),
  gender: yup
    .string()
    .required(`Gender is a required field`)
    .matches(/(female|male)/),
  position: yup.number().required(`Position is a required field`).positive(),
});

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  selectEmpty: {
    minWidth: 120,
  },
  cancelButton: {
    marginLeft: theme.spacing(2),
  },
  createButton: {
    marginBottom: theme.spacing(2),
    width: 200,
  },
}));

// const loadServerRows = async (page: number) => {};

type GenderRadioProps = { label: string } & FieldAttributes<{}>;

const GenderRadio: FC<GenderRadioProps> = ({ label, ...props }): any => {
  const [field] = useField<{}>(props);
  return <FormControlLabel {...field} label={label} control={<Radio />} />;
};

const CustomTextField: FC<FieldAttributes<{}>> = ({
  placeholder,
  required,
  type = "input",
  ...props
}) => {
  const [field, meta] = useField<{}>(props);
  const errorMsg = meta.error && meta.touched ? meta.error : "";
  return (
    <TextField
      required
      placeholder={placeholder}
      {...field}
      type={type}
      helperText={errorMsg}
      error={!!errorMsg}
    />
  );
};

export const EmployeeList = () => {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Employee[] | []>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url: string = page
      ? `http://localhost:8081/employees?limit=10&offset=${page * 10}`
      : `http://localhost:8081/employees?limit=10`;

    fetch(url)
      .then((response) => response.json())
      .then(({ data, total }) => {
        setData(data);
        setRowCount(total);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page]);

  const handleClickDelete = (id: number) => {
    Swal.fire({
      title: "Confirmation",
      text: "Do you want to delete this data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        const body = JSON.stringify({
          isDelete: 1,
        });

        fetch(`http://localhost:8081/employees/${id}`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body,
        })
          .then((response) => response.json())
          .then((response) => {
            if (response.error || response.statusCode >= 400) {
              Swal.fire({
                title: response.error,
                text: response.message,
                icon: "error",
              });
            } else {
              Swal.fire(`Data employee #${id} delete!`);
              setData(data.filter((employee) => employee.id !== id));
            }
          });
      }
    });
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Full Name",
      width: 150,
    },
    {
      field: "birthDate",
      headerName: "Birth Date",
      type: "date",
      width: 160,
      sortable: false,
    },
    {
      field: "position",
      headerName: "Position",
      width: 160,
      sortable: false,
      valueFormatter: (params) => params.row?.position?.name,
    },
    {
      field: "idNumber",
      headerName: "NIP",
      width: 160,
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 160,
      valueFormatter: (params) =>
        params.row?.gender === 1 ? "Male" : "Female",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      sortable: false,
      valueGetter: (params: GridValueGetterParams) =>
        params.getValue(params.id, "id"),
      renderCell: (params: GridCellParams) => (
        <>
          <IconButton
            aria-label="edit"
            onClick={() => {
              history.push(`employees/${params.id}`);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label="delete"
            onClick={() => {
              handleClickDelete(+params.id);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Grid item xs={12}>
      <Paper className={classes.paper}>
        <>
          <Title>Employee List</Title>
          <Button
            className={classes.createButton}
            component={Link}
            to={`${location.pathname}/create`}
            variant="contained"
            color="primary"
            startIcon={<AddBoxIcon />}
          >
            Create New
          </Button>
          <div style={{ width: "100%", height: 400 }}>
            <DataGrid
              rows={data}
              columns={columns}
              pageSize={10}
              pagination
              paginationMode="server"
              onPageChange={(newPage) => setPage(newPage)}
              loading={loading}
              rowCount={rowCount}
            />
          </div>
        </>
      </Paper>
    </Grid>
  );
};

export const EmployeeCreate = () => {
  const classes = useStyles();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const goBack = () => {
    history.push("/");
  };

  const InitialValues = {
    name: "",
    birthDate: "",
    idNumber: "",
    gender: "",
    position: 0,
    isDelete: 0,
  };

  useEffect(() => {
    fetch(`http://localhost:8081/positions`)
      .then((response) => response.json())
      .then(({ data }) => {
        setPositions(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Skeleton />
          <Skeleton animation={false} />
          <Skeleton animation="wave" />
        </Paper>
      </Grid>
    );
  }

  return (
    <Grid item xs={12}>
      <Paper className={classes.paper}>
        <Title>Add New Employee</Title>
        <div style={{ width: "100%" }}>
          <Formik
            initialValues={InitialValues}
            validationSchema={validationSchema}
            onSubmit={(data, { setSubmitting, resetForm }) => {
              Swal.fire({
                title: "Confirmation",
                text: "Do you want to save this data?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "No",
              }).then((result) => {
                if (result.isConfirmed) {
                  setSubmitting(true);
                  const body = JSON.stringify({
                    ...data,
                    gender: data.gender === "male" ? 1 : 2,
                  });
                  console.log(body);
                  fetch(`http://localhost:8081/employees`, {
                    method: "post",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body,
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      if (data.error) {
                        Swal.fire({
                          title: data.error,
                          text: data.message,
                          icon: "error",
                        });
                      } else {
                        resetForm();
                        Swal.fire(`New employee created!`);
                      }
                    })
                    .finally(() => {
                      setSubmitting(false);
                    });
                } else {
                  setSubmitting(false);
                }
              });
            }}
          >
            {({ values, errors, isSubmitting }) => (
              <Form>
                {/* <div>{JSON.stringify(values, null, 2)}</div>
                <div>{JSON.stringify(positions, null, 2)}</div>
                <div>{JSON.stringify(errors, null, 2)}</div> */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FieldTitle>Full Name</FieldTitle>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <CustomTextField
                      name="name"
                      placeholder="Full Name"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FieldTitle>Birth Date</FieldTitle>
                  </Grid>
                  <Grid item xs={8}>
                    <CustomTextField
                      name="birthDate"
                      as={TextField}
                      type="date"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FieldTitle>Position</FieldTitle>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Field
                      required
                      placeholder="asdasd"
                      name="position"
                      type="select"
                      as={Select}
                      className={classes.selectEmpty}
                    >
                      <MenuItem value={0} disabled>
                        == Choose employee position ==
                      </MenuItem>
                      {positions.map((position) => (
                        <MenuItem key={position.id} value={position.id}>
                          {position.name}
                        </MenuItem>
                      ))}
                    </Field>
                    {errors.position && (
                      <FormHelperText error>{errors.position}</FormHelperText>
                    )}
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FieldTitle>NIP</FieldTitle>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <CustomTextField
                      required
                      placeholder="NIP"
                      name="idNumber"
                      type="number"
                      as={TextField}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FieldTitle>Gender</FieldTitle>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <GenderRadio
                      name="gender"
                      value="male"
                      type="radio"
                      label="Male"
                    />
                    <GenderRadio
                      name="gender"
                      value="female"
                      type="radio"
                      label="Female"
                    />
                    {errors.gender && (
                      <FormHelperText error>{errors.gender}</FormHelperText>
                    )}
                  </Grid>
                </Grid>
                <br />
                <Button
                  disabled={isSubmitting}
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={<SaveIcon />}
                >
                  Save
                </Button>
                <Button
                  className={classes.cancelButton}
                  onClick={goBack}
                  disabled={isSubmitting}
                  variant="outlined"
                  color="secondary"
                  type="submit"
                  startIcon={<UndoIcon />}
                >
                  Cancel
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </Paper>
    </Grid>
  );
};

export const EmployeeEdit = () => {
  const classes = useStyles();
  const [positions, setPositions] = useState<Position[]>([]);
  const [data, setData] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const params = useParams<{ id: string }>();

  const goBack = useCallback(() => {
    history.push("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async function () {
      const employeeRes = await fetch(
        `http://localhost:8081/employees/${params.id}`
      );
      const employee = await employeeRes.json();

      if (employee.statusCode >= 400) {
        goBack();
        console.log("goback");
      }
      console.log({ employee });

      setData(employee);

      const posRes = await fetch(`http://localhost:8081/positions`);

      const posData = await posRes.json();

      if (posData.error) {
        goBack();
        console.log("goback");
      }

      setPositions(posData.data);

      setLoading(false);
    })();
  }, [params, goBack]);

  if (loading) {
    return (
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Skeleton />
          <Skeleton animation={false} />
          <Skeleton animation="wave" />
        </Paper>
      </Grid>
    );
  }

  const InitialValues = {
    name: data?.name,
    birthDate: data?.birthDate,
    idNumber: data?.idNumber,
    gender: data?.gender === 1 ? "male" : "female",
    position: data?.position.id,
    isDelete: data?.isDelete,
  };

  return (
    <Grid item xs={12}>
      <Paper className={classes.paper}>
        <>
          <Title>Edit Employee </Title>
          <div style={{ width: "100%" }}>
            <Formik
              initialValues={InitialValues}
              validationSchema={validationSchema}
              onSubmit={(data, { setSubmitting, resetForm }) => {
                Swal.fire({
                  title: "Confirmation",
                  text: "Do you want to save this data?",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Yes",
                  cancelButtonText: "No",
                }).then((result) => {
                  if (result.isConfirmed) {
                    setSubmitting(true);
                    const body = JSON.stringify({
                      ...data,
                      gender: data.gender === "male" ? 1 : 2,
                    });
                    console.log(body);
                    fetch(`http://localhost:8081/employees/${params.id}`, {
                      method: "post",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body,
                    })
                      .then((response) => response.json())
                      .then((data) => {
                        if (data.error) {
                          Swal.fire({
                            title: data.error,
                            text: data.message,
                            icon: "error",
                          });
                        } else {
                          Swal.fire(`Employee #${params.id} updated!`);
                        }
                      })
                      .catch((err) => console.log(err))
                      .finally(() => {
                        setSubmitting(false);
                      });
                  } else {
                    setSubmitting(false);
                  }
                });
              }}
            >
              {({ values, errors, isSubmitting }) => (
                <Form>
                  {/* <div>{JSON.stringify(values, null, 2)}</div>
                <div>{JSON.stringify(positions, null, 2)}</div>
                <div>{JSON.stringify(errors, null, 2)}</div> */}
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <CustomTextField
                        name="name"
                        placeholder="Full Name"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        name="birthDate"
                        as={TextField}
                        type="date"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        required
                        placeholder="asdasd"
                        name="position"
                        type="select"
                        as={Select}
                        className={classes.selectEmpty}
                      >
                        <MenuItem value={0} disabled>
                          == Choose employee position ==
                        </MenuItem>
                        {positions.map((position) => (
                          <MenuItem key={position.id} value={position.id}>
                            {position.name}
                          </MenuItem>
                        ))}
                      </Field>
                      {errors.position && (
                        <FormHelperText error>{errors.position}</FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        required
                        placeholder="NIP"
                        name="idNumber"
                        type="number"
                        as={TextField}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <GenderRadio
                        name="gender"
                        value="male"
                        type="radio"
                        label="Male"
                      />
                      <GenderRadio
                        name="gender"
                        value="female"
                        type="radio"
                        label="Female"
                      />
                      {errors.gender && (
                        <FormHelperText error>{errors.gender}</FormHelperText>
                      )}
                    </Grid>
                  </Grid>
                  <br />
                  <Button
                    disabled={isSubmitting}
                    variant="contained"
                    color="primary"
                    type="submit"
                    startIcon={<SaveIcon />}
                  >
                    Save
                  </Button>
                  <Button
                    className={classes.cancelButton}
                    onClick={() => {
                      history.push("/");
                    }}
                    disabled={isSubmitting}
                    variant="outlined"
                    color="secondary"
                    type="submit"
                    startIcon={<UndoIcon />}
                  >
                    Cancel
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        </>
      </Paper>
    </Grid>
  );
};
