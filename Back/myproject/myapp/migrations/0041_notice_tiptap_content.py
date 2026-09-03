import html

from django.db import migrations, models


def _plain_text_to_html(value):
    escaped = html.escape(value, quote=False)
    normalized = escaped.replace("\r\n", "\n").replace("\r", "\n")
    return f"<p>{normalized.replace(chr(10), '<br>')}</p>"


def convert_plain_text_notices(apps, schema_editor):
    Notice = apps.get_model("myapp", "Notice")
    for notice in Notice.objects.all().iterator():
        notice.content = _plain_text_to_html(notice.content)
        notice.save(update_fields=["content"])


class Migration(migrations.Migration):
    dependencies = [("myapp", "0040_noticeread")]

    operations = [
        migrations.AlterField(
            model_name="notice",
            name="content",
            field=models.TextField(),
        ),
        migrations.RunPython(convert_plain_text_notices, migrations.RunPython.noop),
    ]
