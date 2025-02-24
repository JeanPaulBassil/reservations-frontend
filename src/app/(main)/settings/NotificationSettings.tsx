"use client";

import type {CardProps} from "@heroui/react";
import {Card, CardHeader, CardBody, Button} from "@heroui/react";
import React from "react";

import SwitchCell from "./SwitchCell";

export default function Component(props: CardProps) {
  return (
    <Card className="w-full max-w-lg p-2" {...props}>
      <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
        <p className="text-large">Notification Settings</p>
        <p className="text-small text-default-500">Manage your notification preferences</p>
      </CardHeader>
      <CardBody>
        <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
          <SwitchCell description="Temporarily pause all notifications" label="Pause all" />
        </form>
      </CardBody>
    </Card>
  );
}
