"use client";

import type {CardProps} from "@heroui/react";
import {Card, CardHeader, CardBody, Button} from "@heroui/react";
import {Icon} from "@iconify/react";
import React from "react";

import CellWrapper from "./CellWrapper";
import SwitchCell from "./SwitchCell";

import { useAuth } from "@/components/providers/AuthProvider";

export default function Component(props: CardProps) {
  const { user } = useAuth();
  return (
    <Card className="w-full max-w-lg p-2" {...props}>
      <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
        <p className="text-large">Security Settings</p>
        <p className="text-small text-default-500">Manage your security preferences</p>
      </CardHeader>
      <CardBody className="space-y-2">
        {/* Email */}
        <CellWrapper>
          <div>
            <p>Email Address</p>
            <p className="text-small text-default-500">
              The email address associated with your account.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-6 sm:w-auto sm:flex-nowrap">
            <div className="flex flex-col items-end">
              <p>{user?.email}</p>
              <p className={`text-small ${user?.emailVerified ? "text-success" : "text-danger"}`}>{user?.emailVerified ? "Verified" : "Unverified"}</p>
            </div>
            <Button
              endContent={<Icon icon="solar:pen-2-linear" />}
              radius="sm"
              variant="bordered"
            >
              Edit
            </Button>
          </div>
        </CellWrapper>
        {/* Password */}
        <CellWrapper>
          <div>
            <p>Password</p>
            <p className="text-small text-default-500">
              Set a unique password to protect your account.
            </p>
          </div>
          <Button radius="sm" variant="bordered">
            Change
          </Button>
        </CellWrapper>
        {/* Two-Factor Authentication */}
        <SwitchCell
          defaultSelected
          description="Add an extra layer of security to your account."
          label="Two-Factor Authentication"
        />
        {/* Password Reset Protection */}
        <SwitchCell
          description="Require additional information to reset your password."
          label="Password Reset Protection"
        />
        {/* Require Pin */}
        <SwitchCell
          defaultSelected
          description="Require a pin to access your account."
          label="Require Pin"
        />
        {/* Delete Account */}
        <CellWrapper>
          <div>
            <p>Delete Account</p>
            <p className="text-small text-default-500">Delete your account and all your data.</p>
          </div>
          <Button color="danger" radius="sm" variant="flat">
            Delete
          </Button>
        </CellWrapper>
      </CardBody>
    </Card>
  );
}
