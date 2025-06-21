import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                感谢您的注册！
              </CardTitle>
              <CardDescription>请检查您的电子邮件以进行确认</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                您已成功注册。请在登录前检查您的电子邮件以确认您的帐户。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
