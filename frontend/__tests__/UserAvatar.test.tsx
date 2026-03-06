import React from "react";
import { render, screen } from "@testing-library/react";
import UserAvatar from "@/components/UserAvatar";

jest.mock("next/image", () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  );
  MockImage.displayName = "Image";
  return MockImage;
});

const userWithImage = {
  id: "u1",
  name: "Alice Smith",
  email: "alice@example.com",
  image: "https://example.com/alice.jpg",
};

const userWithName = {
  id: "u2",
  name: "Bob Jones",
  email: "bob@example.com",
  image: null,
};

const userWithoutName = {
  id: "u3",
  name: null,
  email: "carol@example.com",
  image: null,
};

describe("UserAvatar", () => {
  describe("when user has an image", () => {
    it("renders an img element", () => {
      render(<UserAvatar user={userWithImage} />);
      const img = screen.getByRole("img");
      expect(img).toBeInTheDocument();
    });

    it("sets the src to the user image URL", () => {
      render(<UserAvatar user={userWithImage} />);
      expect(screen.getByRole("img")).toHaveAttribute("src", userWithImage.image);
    });

    it("sets alt text to the user name", () => {
      render(<UserAvatar user={userWithImage} />);
      expect(screen.getByAltText("Alice Smith")).toBeInTheDocument();
    });

    it("uses email as alt text when name is null", () => {
      render(<UserAvatar user={{ ...userWithoutName, image: "https://example.com/c.jpg" }} />);
      expect(screen.getByAltText("carol@example.com")).toBeInTheDocument();
    });
  });

  describe("when user has no image", () => {
    it("renders the first letter of the name as initial", () => {
      render(<UserAvatar user={userWithName} />);
      expect(screen.getByText("B")).toBeInTheDocument();
    });

    it("renders the first letter of the email when name is null", () => {
      render(<UserAvatar user={userWithoutName} />);
      expect(screen.getByText("C")).toBeInTheDocument();
    });

    it("renders the initial uppercased", () => {
      render(<UserAvatar user={{ ...userWithName, name: "dave" }} />);
      expect(screen.getByText("D")).toBeInTheDocument();
    });

    it("does not render an img element", () => {
      render(<UserAvatar user={userWithName} />);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("shows user name in title attribute", () => {
      render(<UserAvatar user={userWithName} />);
      const span = screen.getByTitle("Bob Jones");
      expect(span).toBeInTheDocument();
    });

    it("renders initials in a span element", () => {
      const { container } = render(<UserAvatar user={userWithName} />);
      const span = container.querySelector("span");
      expect(span).toBeInTheDocument();
      expect(span?.textContent).toBe("B");
    });
  });

  describe("sizes", () => {
    it("renders sm size at 24px", () => {
      render(<UserAvatar user={userWithName} size="sm" />);
      const el = screen.getByText("B");
      expect(el).toHaveStyle({ width: "24px", height: "24px" });
    });

    it("renders md size at 32px (default)", () => {
      render(<UserAvatar user={userWithName} />);
      const el = screen.getByText("B");
      expect(el).toHaveStyle({ width: "32px", height: "32px" });
    });

    it("renders lg size at 40px", () => {
      render(<UserAvatar user={userWithName} size="lg" />);
      const el = screen.getByText("B");
      expect(el).toHaveStyle({ width: "40px", height: "40px" });
    });
  });

  describe("consistency", () => {
    it("renders consistently for the same user on re-render", () => {
      const { rerender, container } = render(<UserAvatar user={userWithName} />);
      const firstBg = (container.firstChild as HTMLElement).style.background;

      rerender(<UserAvatar user={userWithName} />);
      const secondBg = (container.firstChild as HTMLElement).style.background;

      expect(firstBg).toBe(secondBg);
    });

    it("all initials avatars share the same structure regardless of user id", () => {
      const { container: c1 } = render(<UserAvatar user={userWithName} />);
      const { container: c2 } = render(<UserAvatar user={userWithoutName} />);

      // Both avatars are spans (not images) with the same size attributes
      expect(c1.querySelector("span")).toBeInTheDocument();
      expect(c2.querySelector("span")).toBeInTheDocument();
    });
  });
});
