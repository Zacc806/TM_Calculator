import { describe, it, expect } from "vitest";
import type { ReactElement } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LangProvider } from "../../i18n";
import { Calculator } from "./Calculator";

const renderCalc = (ui: ReactElement) => render(<LangProvider>{ui}</LangProvider>);

describe("Calculator", () => {
  it("renders the dominant monthly payment for the initial input", async () => {
    // 100 000 ₸, 0% down, 12% annual, 12 mo → 8 885 ₸/mo
    renderCalc(
      <Calculator
        context="standalone"
        initial={{ cost: 100_000, downPaymentPercent: 0, annualRatePercent: 12, termMonths: 12 }}
        showActions={false}
      />,
    );
    expect(screen.getByText("Ежемесячный платёж")).toBeInTheDocument();
    expect(await screen.findByText(/8\s*885\s*₸/u)).toBeInTheDocument();
  });

  it("shows the program presets", async () => {
    renderCalc(<Calculator context="standalone" showActions={false} />);
    // The program picker is a custom listbox; options render once it's opened.
    fireEvent.click(screen.getByRole("button", { name: /программа покупки/i }));
    expect(await screen.findByRole("option", { name: "Рассрочка застройщика" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "7-20-25" })).toBeInTheDocument();
  });
});
