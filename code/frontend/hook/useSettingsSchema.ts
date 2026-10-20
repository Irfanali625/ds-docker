import * as yup from "yup";

export const useSettingsSchema = () => {
  return yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup
      .string()
      .email("Invalid email address")
      .required("Email is required"),

    oldPassword: yup
      .string()
      .nullable()
      .transform((v) => (v === "" ? null : v)),

    newPassword: yup
      .string()
      .nullable()
      .transform((v) => (v === "" ? null : v))
      .when("oldPassword", {
        is: (val: string | null) => val && val.length > 0,
        then: (schema) =>
          schema
            .min(8, "Password must be at least 8 characters")
            .required("New password is required"),
        otherwise: (schema) => schema.notRequired(),
      }),

    confirmPassword: yup
      .string()
      .nullable()
      .transform((v) => (v === "" ? null : v))
      .when("newPassword", {
        is: (val: string | null) => val && val.length > 0,
        then: (schema) =>
          schema
            .required("Please confirm your new password")
            .oneOf([yup.ref("newPassword")], "Passwords do not match"),
        otherwise: (schema) => schema.notRequired(),
      }),
  });
};
