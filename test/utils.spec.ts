import { describe, expect, it } from "@jest/globals";
import { getAllowedExtension } from "../src/utils";
import { findFirst } from "../src/fs";

describe("getAllowedExtension", () => {
  it("must succeed", () => {
    expect(true).toBe(true);
  });

  it("Must return a valid extension if a valid string is provided", () => {
    const result = getAllowedExtension("png", "*");

    expect(result.val).toBe("png");
  });

  it("Must accept JPG as JPEG", () => {
    const result = getAllowedExtension("jpg", "*");

    expect(result.val).toBe("jpeg");
  });

  it("Must find the first file matching a glob path", async () => {
    const result = await findFirst(`${__dirname}/images/giraffe.*`);

    expect(result.value).toContain("images/test/images/giraffe.png");
  });
});

