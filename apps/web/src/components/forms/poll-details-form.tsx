import { FormField, FormItem, FormLabel, FormMessage } from "@rallly/ui/form";
import { Input } from "@rallly/ui/input";
import { Textarea } from "@rallly/ui/textarea";
import { useFormContext } from "react-hook-form";

import { Trans } from "@/components/trans";
import { useTranslation } from "@/i18n/client";
import { useFormValidation } from "@/utils/form-validation";
import { TopicsInput } from "./topics-input";
import type { NewEventData } from "./types";

export interface PollDetailsData {
  title: string;
  location: string;
  description: string;
  topics: string[];
}

export const PollDetailsForm = () => {
  const { t } = useTranslation();
  const form = useFormContext<NewEventData>();

  const { requiredString } = useFormValidation();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid gap-4 py-1">
      <FormField
        control={form.control}
        name="title"
        rules={{
          validate: requiredString(t("title")),
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="title">{t("title")}</FormLabel>
            <Input
              {...field}
              type="text"
              error={!!errors.title}
              id="title"
              data-testid="title-input"
              className="w-full"
              placeholder={t("titlePlaceholder")}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem>
        <div>
          <FormLabel className="inline-block" htmlFor="location">
            {t("location")}
          </FormLabel>
          <span className="ml-1 text-muted-foreground text-sm">
            <Trans i18nKey="optionalLabel" defaults="(Optional)" />
          </span>
        </div>
        <Input
          type="text"
          id="location"
          data-testid="location-input"
          className="w-full"
          placeholder={t("locationPlaceholder")}
          {...register("location")}
        />
      </FormItem>
      <FormItem>
        <div>
          <FormLabel className="inline-block" htmlFor="description">
            {t("description")}
          </FormLabel>
          <span className="ml-1 text-muted-foreground text-sm">
            <Trans i18nKey="optionalLabel" defaults="(Optional)" />
          </span>
        </div>
        <Textarea
          className="w-full"
          id="description"
          data-testid="description-input"
          placeholder={t("descriptionPlaceholder")}
          rows={5}
          {...register("description")}
        />
      </FormItem>
      <TopicsInput
        name="topics"
        label={t("topics")}
        placeholder={t("topicsPlaceholder")}
      />
    </div>
  );
};
