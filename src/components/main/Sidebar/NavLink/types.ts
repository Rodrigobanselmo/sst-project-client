import { ElementType } from "react";
import { LinkProps } from "@chakra-ui/react";

export interface INavLinkProps extends LinkProps {
  icon: ElementType;
  href: string;
  text: string;
  description: string;
}
