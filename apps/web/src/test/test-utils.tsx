import { Form } from "@rallly/ui/form";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import { render as rtlRender, waitFor } from "@testing-library/react";
import { createInstance } from "i18next";
import ICU from "i18next-icu";
import resourcesToBackend from "i18next-resources-to-backend";
import type { ReactElement } from "react";
import type {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import { useForm } from "react-hook-form";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { defaultNS, getOptions } from "@/i18n/settings";

interface TestWrapperProps {
  children: React.ReactNode;
  locale?: string;
}

function TestWrapper({ children, locale = "en" }: TestWrapperProps) {
  // Create a synchronous i18n instance for tests
  const i18n = createInstance()
    .use(initReactI18next)
    .use(ICU)
    .use(
      resourcesToBackend((language: string, namespace: string) => {
        return import(`../../public/locales/${language}/${namespace}.json`);
      }),
    );

  // Initialize synchronously for tests
  i18n.init({
    ...getOptions(locale),
    react: {
      useSuspense: false, // Important for tests
    },
  });

  return (
    <I18nextProvider i18n={i18n} defaultNS={defaultNS}>
      {children}
    </I18nextProvider>
  );
}

interface CustomRenderOptions extends RenderOptions {
  locale?: string;
}

function render(
  ui: ReactElement,
  options: CustomRenderOptions = {},
): RenderResult {
  const { locale, ...renderOptions } = options;

  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <TestWrapper locale={locale}>{children}</TestWrapper>
    ),
    ...renderOptions,
  });
}

interface RenderWIthFormOptions<T> {
  defaultValues?: DefaultValues<T>;
  onSubmit?: SubmitHandler<T>;
}

function renderWithForm<T extends FieldValues>(
  ui: React.ReactElement,
  options?: RenderWIthFormOptions<T>,
) {
  let formInstance: UseFormReturn<T>;

  const { onSubmit, defaultValues } = options || {};

  const FormWrapper = ({ children }: { children: React.ReactNode }) => {
    const form = useForm<T>({
      defaultValues,
    });

    formInstance = form;

    return (
      <TestWrapper locale="en">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit ?? vi.fn())}>
            {children}
            <button type="submit" data-testid="submit-button">
              Submit
            </button>
          </form>
        </Form>
      </TestWrapper>
    );
  };

  const result = render(ui, {
    wrapper: FormWrapper,
  });

  return {
    ...result,
    // biome-ignore lint/style/noNonNullAssertion: it always will have a value
    form: formInstance!,
    // Helper methods for common testing patterns
    getFieldValue: (name: Path<T>) => formInstance?.getValues(name),
    getAllValues: () => formInstance?.getValues(),
    waitForFormValue: async (
      name: Path<T>,
      value: string | string[] | undefined,
    ) => {
      await waitFor(() => {
        const formValue = formInstance?.getValues(name);
        if (Array.isArray(value)) {
          expect(formValue).toStrictEqual(value);
        } else {
          expect(formValue).toBe(value);
        }
      });
    },
  };
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render export
export { render, TestWrapper, renderWithForm };
