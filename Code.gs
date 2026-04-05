function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var timestamp = new Date();
    var guests = payload.guests || [];

    Logger.log('Received ' + guests.length + ' guests');
    Logger.log(JSON.stringify(guests));

    // One row per guest
    guests.forEach(function(guest) {
      sheet.appendRow([
        timestamp,
        guest.name,
        guest.group,
        guest.email,
        guest.attending,
        guest.arrives  || '',
        guest.onsite   || '',
        guest.dietary  || '',
        guest.note     || ''
      ]);
    });

    // One summary email to you per submission
    var summary = guests.map(function(g) {
      var parts = [g.name + ': ' + g.attending];
      if (g.arrives)  parts.push('Arrives ' + g.arrives);
      if (g.onsite)   parts.push('Onsite: ' + g.onsite);
      if (g.dietary)  parts.push('Dietary: ' + g.dietary);
      return parts.join(' | ');
    }).join('\n');

    var first = guests[0] || {};
    var emails = guests.map(function(g) { return g.name + ': ' + (g.email || 'N/A'); }).join(', ');
    var body = 'New RSVP from ' + (first.group || 'Unknown') + '\n\n'
             + summary + '\n\n'
             + (first.note ? 'Note: ' + first.note + '\n\n' : '')
             + 'Emails: ' + emails;

    var recipients = ['natalieandjordi@gmail.com'];
    recipients.forEach(function(addr) {
      MailApp.sendEmail({ to: addr, subject: 'RSVP: ' + (first.group || 'New Response'), body: body });
    });

    // Confirmation email to each guest
    sendConfirmationEmail(guests);

    return ContentService.createTextOutput('ok');
  } catch(err) {
    Logger.log('doPost error: ' + err.toString());
    return ContentService.createTextOutput('error: ' + err.toString());
  }
}

function sendConfirmationEmail(guests) {
  var note = (guests[0] && guests[0].note) ? guests[0].note : '';

  // Venmo info for onsite guests (compute once)
  var onsiteCount = 0;
  guests.forEach(function(gg) {
    if (gg.attending === 'Yes' && gg.onsite === 'Yes') onsiteCount++;
  });

  guests.forEach(function(g, idx) {
    try {
      var email = (g.email || '').trim();
      if (!email) {
        Logger.log('Guest ' + idx + ' (' + g.name + ') has no email, skipping');
        return;
      }

      Logger.log('Sending confirmation to guest ' + idx + ': ' + g.name + ' at ' + email);

      var firstName = (g.name || '').split(' ')[0];

      var lines = [];
      lines.push('Hi ' + firstName + ',');
      lines.push('');
      lines.push("We've received your RSVP for Natalie & Jordi's wedding! Here's a summary:");
      lines.push('');

      guests.forEach(function(gg) {
        lines.push('  ' + gg.name + ' \u2014 ' + gg.attending);
        if (gg.attending === 'Yes') {
          if (gg.arrives)  lines.push('    Arriving: ' + gg.arrives);
          if (gg.onsite)   lines.push('    Staying onsite: ' + gg.onsite);
          if (gg.dietary)  lines.push('    Dietary needs: ' + gg.dietary);
        }
        lines.push('');
      });

      if (note) {
        lines.push('Your note: "' + note + '"');
        lines.push('');
      }

      if (onsiteCount > 0) {
        var total = onsiteCount * 275;
        lines.push('---');
        lines.push('');
        lines.push('ONSITE ACCOMMODATION');
        lines.push('The fee for staying onsite at Wildhaven is $275 per person.');
        lines.push('Total for your group: $' + total + ' (' + onsiteCount + (onsiteCount === 1 ? ' guest' : ' guests') + ' \u00d7 $275)');
        lines.push('');
        lines.push('Please Venmo Natalie at: @Natali-Dunn');
        lines.push('(https://venmo.com/u/Natali-Dunn)');
        lines.push('');
      }

      lines.push('If anything changes, just submit the form again and we\'ll update your info.');
      lines.push('');
      lines.push('See you in Sonoma!');
      lines.push('\u2014 Natalie & Jordi');

      MailApp.sendEmail({
        to: email,
        subject: "RSVP Confirmation \u2014 Natalie & Jordi's Wedding",
        body: lines.join('\n')
      });

      Logger.log('Successfully sent to ' + email);
    } catch(err) {
      Logger.log('Error sending to guest ' + idx + ' (' + g.name + ', ' + (g.email || 'no email') + '): ' + err.toString());
    }
  });
}
