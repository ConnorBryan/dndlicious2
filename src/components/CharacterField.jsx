import React, { useContext } from "react";
import { Button, Form } from "semantic-ui-react";

import { PermissionContext } from "../App";

export default function CharacterField(props) {
  const isPermitted = useContext(PermissionContext);

  if (!isPermitted) {
    return <Form.Input disabled label={props.display} {...props.field} />;
  }

  if (props.type === "text") {
    return (
      <Form.Input
        label={props.display}
        type="text"
        {...props.field}
        style={{ width: "300px" }}
      />
    );
  }

  if (props.type === "number") {
    return (
      <Form.Input
        label={props.noLabel ? undefined : props.display}
        type="number"
        {...props.field}
        style={{
          width: "80px"
        }}
      >
        <Button
          type="button"
          style={{
            marginRight: 0
          }}
          onClick={() =>
            props.form.setFieldValue(props.field.name, props.field.value - 1)
          }
        >
          -
        </Button>
        <input />
        <Button
          type="button"
          onClick={() =>
            props.form.setFieldValue(props.field.name, props.field.value + 1)
          }
        >
          +
        </Button>
      </Form.Input>
    );
  }

  if (props.type === "textarea") {
    return (
      <Form.TextArea
        label={props.display}
        {...props.field}
        style={{ width: "400px", height: "auto" }}
        rows={100}
      />
    );
  }

  if (props.type === "checkbox") {
    return (
      <Form.Checkbox
        label={props.display}
        checked={props.field.value}
        {...props.field}
      />
    );
  }

  return isPermitted ? "Yes" : "No";
}
