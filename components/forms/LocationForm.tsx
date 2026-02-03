"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Navigation, MapPinned, Loader2 } from "lucide-react";
import { locationValidator, LocationValType } from "@/validations";
import { useTransition } from "react";

export default function LocationForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<LocationValType>({
    resolver: zodResolver(locationValidator),
    defaultValues: {
      city: "",
      country: "",
      latitude: 0,
      longitude: 0,
      address: null,
    },
  });

  const onSubmit = (data: LocationValType) => {
    startTransition(async () => {
      console.log("Form submitted:", data);
      // Add your submission logic here
    });
  };

  return (
    <div className="w-full max-w-2xl p-4">
      <div className="relative">
        {/* Geometric background elements */}
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-500/10 rounded-lg rotate-12 blur-xl" />
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-indigo-500/10 rounded-lg -rotate-12 blur-xl" />

        {/* Main form container */}
        <div className="relative bg-white dark:bg-gray-950 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Header with geometric accent */}
          <div className="relative bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-800 px-8 py-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-tr-full" />

            <div className="relative flex items-center gap-4">
              <div className="size-13 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 rotate-3 hover:rotate-6 transition-transform">
                <MapPin className="size-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-mono tracking-tight bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  LOCATION_DATA
                </h1>
                <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">
                  {"// "} Geographic coordinate form
                </p>
              </div>
            </div>
          </div>

          {/* Form content */}
          <div className="px-8 py-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* Geographic Info Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pb-2">
                    <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-blue-500 to-transparent" />
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400 tracking-wider">
                      GEOGRAPHIC_INFO
                    </span>
                    <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-blue-500 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                            <div className="size-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <MapPinned className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            city<span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Cairo"
                              className="font-mono border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                            <div className="size-6 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                              <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            country<span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Egypt"
                              className="font-mono border-2 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Coordinates Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pb-2">
                    <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-purple-500 to-transparent" />
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400 tracking-wider">
                      COORDINATES
                    </span>
                    <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-purple-500 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                            <div className="size-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center font-medium text-xs text-purple-600 dark:text-purple-400">
                              φ
                            </div>
                            latitude<span className="text-red-500">*</span>
                            <span className="text-xs text-gray-400">
                              [-90, 90]
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              placeholder="30.0444"
                              className="font-mono border-2 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : 0,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                            <div className="size-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center font-medium text-xs text-purple-600 dark:text-purple-400">
                              λ
                            </div>
                            longitude<span className="text-red-500">*</span>
                            <span className="text-xs text-gray-400">
                              [-180, 180]
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              placeholder="31.2357"
                              className="font-mono border-2 focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : 0,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pb-2">
                    <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-green-500 to-transparent" />
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400 tracking-wider">
                      OPTIONAL_DATA
                    </span>
                    <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-green-500 to-transparent" />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                          <div className="size-6 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Navigation className="size-4 text-green-600 dark:text-green-400" />
                          </div>
                          address
                          <span className="text-xs text-gray-400 font-normal">
                            (nullable)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main Street, District"
                            className="font-mono border-2 focus:border-green-500 dark:focus:border-green-400 transition-colors"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
                        </FormControl>
                        <FormMessage className="font-mono text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 font-mono font-semibold text-sm tracking-wide bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        processing...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        save location
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 font-mono font-semibold text-sm tracking-wide border-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    onClick={() => form.reset()}
                    disabled={isPending}
                  >
                    RESET()
                  </Button>
                </div>

                <div className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>FORM_STATUS: READY</span>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
